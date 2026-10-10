import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeAgentStep, normalizeStepError } from './executeAgentStep'
import { runAgent } from './llmAdapter'
import { recordAnalyticsRun } from './useAnalytics'

vi.mock('./llmAdapter', () => ({
  runAgent: vi.fn(),
}))
vi.mock('./useAnalytics', () => ({
  recordAnalyticsRun: vi.fn(() => true),
}))

const agent = { id: 'ag', name: 'A', category: 'C' }
const base = {
  agent,
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: 'k',
  systemPrompt: 'sys',
  userMessage: 'hi',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('normalizeStepError', () => {
  it('passes aborts through untouched', () => {
    const abort = new DOMException('aborted', 'AbortError')
    expect(normalizeStepError(abort)).toBe(abort)
  })

  it('adds provider context and keeps the cause', () => {
    const err = new Error('boom')
    const out = normalizeStepError(err, { provider: 'openai', model: 'gpt-4o' })
    expect(out.message).toContain('boom')
    expect(out.message).toContain('openai')
    expect(out.cause).toBe(err)
  })

  it('handles non-errors', () => {
    expect(normalizeStepError(null).message).toMatch(/unknown/i)
    expect(normalizeStepError('oops').message).toMatch(/unknown/i)
  })
})

describe('executeAgentStep', () => {
  it('runs, records analytics, and returns the result', async () => {
    runAgent.mockResolvedValue({ content: 'out', duration: 7 })
    const result = await executeAgentStep(base)
    expect(result.content).toBe('out')
    expect(runAgent).toHaveBeenCalledWith(
      {
        provider: 'openai',
        model: 'gpt-4o-mini',
        apiKey: 'k',
        systemPrompt: 'sys',
        userMessage: 'hi',
      },
      { signal: undefined }
    )
    expect(recordAnalyticsRun).toHaveBeenCalledWith(
      expect.objectContaining({ agentId: 'ag', provider: 'openai' })
    )
  })

  it('skips analytics without an agent id', async () => {
    runAgent.mockResolvedValue({ content: 'out', duration: 1 })
    await executeAgentStep({ ...base, agent: { name: 'ghost' } })
    expect(recordAnalyticsRun).not.toHaveBeenCalled()
  })
})
