import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./llmAdapter', () => ({ runAgent: vi.fn() }))
vi.mock('./useAnalytics', () => ({ recordAnalyticsRun: vi.fn() }))

import { runAgent } from './llmAdapter'
import { runBatch } from './batchRunner'

const agent = {
  id: 'summariser',
  name: 'Summariser',
  category: 'writing',
  inputs: [{ id: 'text', label: 'Text' }],
}

function finalStatuses(updates, count) {
  const status = Array(count).fill('waiting')
  for (const [index, patch] of updates) {
    if (patch.status) status[index] = patch.status
  }
  return status
}

describe('runBatch', () => {
  beforeEach(() => {
    runAgent.mockReset()
  })

  it('marks in-flight and unstarted items as cancelled when stopped', async () => {
    const controller = new AbortController()
    runAgent.mockImplementation((_req, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')))
    }))
    const updates = []

    const run = runBatch({
      items: ['a', 'b', 'c', 'd', 'e'],
      agent,
      fixedInputs: {},
      batchFieldId: 'text',
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: 'key',
      systemPrompt: '',
      concurrency: 2,
      onItemUpdate: (index, patch) => updates.push([index, patch]),
      signal: controller.signal,
    })
    await Promise.resolve()
    controller.abort()
    await run

    expect(finalStatuses(updates, 5)).toEqual(Array(5).fill('cancelled'))
  })

  it('keeps finished results when a later item is stopped', async () => {
    const controller = new AbortController()
    runAgent
      .mockResolvedValueOnce({ content: 'summary a', duration: 1 })
      .mockImplementationOnce((_req, { signal }) => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('aborted')))
        queueMicrotask(() => controller.abort())
      }))
    const updates = []

    await runBatch({
      items: ['a', 'b', 'c'],
      agent,
      fixedInputs: {},
      batchFieldId: 'text',
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: 'key',
      systemPrompt: '',
      concurrency: 1,
      onItemUpdate: (index, patch) => updates.push([index, patch]),
      signal: controller.signal,
    })

    expect(finalStatuses(updates, 3)).toEqual(['done', 'cancelled', 'cancelled'])
  })

  it('reports no cancellations for a batch that runs to completion', async () => {
    runAgent.mockResolvedValue({ content: 'ok', duration: 1 })
    const updates = []

    await runBatch({
      items: ['a', 'b'],
      agent,
      fixedInputs: {},
      batchFieldId: 'text',
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: 'key',
      systemPrompt: '',
      onItemUpdate: (index, patch) => updates.push([index, patch]),
    })

    expect(finalStatuses(updates, 2)).toEqual(['done', 'done'])
  })
})
