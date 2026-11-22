// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./llmAdapter', () => ({ runAgent: vi.fn() }))
vi.mock('./useAnalytics', () => ({ recordAnalyticsRun: vi.fn() }))

import { runAgent } from './llmAdapter'
import { runBatch } from './batchRunner'

const agent = {
  id: 'test-agent',
  name: 'Test Agent',
  category: 'Test',
  inputs: [{ id: 'text', label: 'Text', type: 'text' }],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('runBatch cancellation', () => {
  it('marks running items cancelled and leaves waiting items cancelled after stop', async () => {
    const controller = new AbortController()
    runAgent.mockImplementation(async (_params, options) => {
      await new Promise((resolve) => {
        if (options.signal.aborted) resolve()
        options.signal.addEventListener('abort', resolve, { once: true })
      })
      throw new DOMException('The operation was aborted.', 'AbortError')
    })

    const updates = []
    const run = runBatch({
      items: ['one', 'two', 'three'],
      agent,
      fixedInputs: {},
      batchFieldId: 'text',
      provider: 'openai',
      model: 'test',
      apiKey: 'test-key',
      systemPrompt: 'test',
      concurrency: 1,
      onItemUpdate: (index, patch) => updates.push({ index, ...patch }),
      signal: controller.signal,
    })

    await vi.waitFor(() => {
      expect(updates.some((update) => update.index === 0 && update.status === 'running')).toBe(true)
    })
    controller.abort()
    await run

    const finalUpdateFor = (index) => updates.filter((update) => update.index === index).at(-1)

    expect(finalUpdateFor(0)?.status).toBe('cancelled')
    expect(updates.some((update) => update.index === 1 && update.status === 'cancelled')).toBe(true)
    expect(updates.some((update) => update.index === 2 && update.status === 'cancelled')).toBe(true)
  })

  it('preserves completed items and marks unfinished items cancelled', async () => {
    const controller = new AbortController()
    runAgent.mockImplementation(async () => {
      return { content: 'complete', duration: 1 }
    })

    const updates = []
    await runBatch({
      items: ['one', 'two'],
      agent,
      fixedInputs: {},
      batchFieldId: 'text',
      provider: 'openai',
      model: 'test',
      apiKey: 'test-key',
      systemPrompt: 'test',
      concurrency: 1,
      onItemUpdate: (index, patch) => updates.push({ index, ...patch }),
      signal: controller.signal,
    })

    expect(updates).toContainEqual(expect.objectContaining({ index: 0, status: 'done', output: 'complete' }))
    expect(updates).toContainEqual(expect.objectContaining({ index: 1, status: 'done', output: 'complete' }))
  })
})
