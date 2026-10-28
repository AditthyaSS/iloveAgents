/**
 * Batch Runner — core logic for running an agent across many inputs.
 * No UI here. Used by BatchModeRunner.jsx.
 */

import { runAgent } from './llmAdapter'
import { recordAnalyticsRun } from './useAnalytics'

export function parsePastedLines(raw) {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

export function parseCSV(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  const pushField = () => {
    row.push(field)
    field = ''
  }
  const pushRow = () => {
    pushField()
    rows.push(row)
    row = []
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        pushField()
      } else if (char === '\r') {
        // skip
      } else if (char === '\n') {
        pushRow()
      } else {
        field += char
      }
    }
  }

  if (field.length > 0 || row.length > 0) {
    pushRow()
  }

  const nonEmptyRows = rows.filter((r) => r.some((cell) => cell.trim() !== ''))
  return { rows: nonEmptyRows }
}

export function buildBatchUserMessage(agent, fixedInputs, batchFieldId, itemValue) {
  const parts = []
  agent.inputs.forEach((input) => {
    const val = input.id === batchFieldId ? itemValue : fixedInputs[input.id]
    if (!val || (Array.isArray(val) && val.length === 0)) return

    const sanitizedVal = typeof val === 'string' ? val.trim() : val
    if (sanitizedVal === '') return

    parts.push(
      Array.isArray(sanitizedVal)
        ? `${input.label}: ${sanitizedVal.join(', ')}`
        : `${input.label}: ${sanitizedVal}`
    )
  })

  return parts.join('\n\n').trim().replace(/\n{3,}/g, '\n\n')
}

export async function runBatch({
  items,
  agent,
  fixedInputs,
  batchFieldId,
  provider,
  model,
  apiKey,
  systemPrompt,
  concurrency = 3,
  onItemUpdate,
  signal,
}) {
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      if (signal?.aborted) return
      const index = cursor++
      const itemValue = items[index]

      onItemUpdate(index, { status: 'running' })

      try {
        const userMessage = buildBatchUserMessage(agent, fixedInputs, batchFieldId, itemValue)
        const result = await runAgent(
          { provider, model, apiKey, systemPrompt, userMessage },
          { signal }
        )
        if (signal?.aborted) return
        recordAnalyticsRun({
          agentId: agent.id,
          agentName: agent.name,
          category: agent.category,
          provider,
          model,
          duration: result.duration,
        })
        onItemUpdate(index, { status: 'done', output: result.content })
      } catch (err) {
        if (signal?.aborted) return
        onItemUpdate(index, {
          status: 'failed',
          error: err?.message || err?.detail || 'Failed to process this item.',
        })
      }
    }
  }

  const workerCount = Math.min(concurrency, items.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))

  // Mark any remaining waiting or running items as cancelled if aborted/stopped
  if (signal?.aborted) {
    for (let i = 0; i < items.length; i++) {
      onItemUpdate(i, (current) => {
        if (!current || current.status === 'waiting' || current.status === 'running') {
          return { status: 'cancelled' }
        }
        return current
      })
    }
  }
}
