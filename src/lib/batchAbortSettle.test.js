import { describe, it, expect, vi } from 'vitest'
import { runBatch } from './batchRunner'
import { runAgent } from './llmAdapter'

vi.mock('./llmAdapter', () => ({
  runAgent: vi.fn(),
}))
vi.mock('./useAnalytics', () => ({
  recordAnalyticsRun: vi.fn(() => true),
}))

const agent = { id: 'ag', name: 'A', category: 'C', inputs: [] }

function deferred() {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}

describe('runBatch abort settle', () => {
  it('marks started and unstarted rows cancelled with no row left running', async () => {
    const first = deferred()
    runAgent.mockReturnValueOnce(first.promise)
    const updates = []
    const controller = new AbortController()
    const done = runBatch({
      items: ['a', 'b', 'c'],
      agent,
      fixedInputs: {},
      batchFieldId: 'topic',
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: 'k',
      systemPrompt: 'sys',
      concurrency: 1,
      onItemUpdate: (index, patch) => updates.push([index, patch.status]),
      signal: controller.signal,
    })
    await new Promise((r) => setTimeout(r, 10))
    controller.abort()
    first.resolve({ content: 'out', duration: 5 })
    await done
    const byIndex = new Map()
    updates.forEach(([i, s]) => byIndex.set(i, s))
    expect(byIndex.get(0)).toBe('cancelled')
    expect(byIndex.get(1)).toBe('cancelled')
    expect(byIndex.get(2)).toBe('cancelled')
    expect([...byIndex.values()]).not.toContain('running')
    expect(runAgent).toHaveBeenCalledTimes(1)
  })
})
