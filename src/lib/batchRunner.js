/**
 * Batch Runner — core logic for running an agent across many inputs.
 * No UI here. Used by BatchModeRunner.jsx.
 */

import { runAgent } from './llmAdapter'

/**
 * Parse pasted multi-line text into batch items.
 * One non-empty line = one item.
 */
export function parsePastedLines(raw) {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

/**
 * Minimal CSV parser — no external dependency.
 * Handles quoted fields, escaped quotes (""), and commas inside quotes.
 * Returns { headers: string[]|null, rows: string[][] }
 */
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
        // skip, \n will trigger row end
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

/**
 * Detect whether a parsed CSV's first row looks like a header
 * (heuristic: no purely numeric-looking cells, reasonably short).
 */

/**
 * NOTE: We deliberately do NOT try to auto-detect whether a CSV's first
 * row is a header by inspecting its content. Free-text items (e.g. a
 * resume snippet like "Doe, Jane - Software Engineer") are indistinguishable
 * from a genuine header row using any content heuristic, and guessing wrong
 * silently drops the first real item. Instead, the UI always shows the user
 * the parsed first row and lets them confirm whether to treat it as a
 * header — see the "First row is a header" toggle in BatchModeRunner.
 */

/**
 * Build the full user message for one batch item, substituting the
 * batch field value into the fixed inputs and formatting the same way
 * AgentRunner's buildUserMessage does.
 */
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

/**
 * Run a batch of items against an agent with limited concurrency.
 *
 * @param {Object} params
 * @param {string[]} params.items - the per-row values for the batch field
 * @param {Object} params.agent
 * @param {Object} params.fixedInputs - values for all non-batch fields
 * @param {string} params.batchFieldId
 * @param {string} params.provider
 * @param {string} params.model
 * @param {string} params.apiKey
 * @param {string} params.systemPrompt
 * @param {number} [params.concurrency=3]
 * @param {(index: number, patch: object) => void} params.onItemUpdate
 * @param {AbortSignal} [params.signal]
 * @returns {Promise<void>}
 */
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
}
