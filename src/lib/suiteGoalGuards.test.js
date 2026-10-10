import { describe, it, expect, vi } from 'vitest'
import { generateCustomSuite, buildSuiteUserMessage, resolveSuiteModel } from './customSuiteGenerator'
import { streamAgent } from './llmAdapter'

vi.mock('./llmAdapter', () => ({
  streamAgent: vi.fn(),
}))
vi.mock('./useAnalytics', () => ({
  recordAnalyticsRun: vi.fn(() => true),
}))

describe('customSuiteGenerator guards', () => {
  it('trims, caps, and rejects blank goals', () => {
    expect(buildSuiteUserMessage('  launch  ')).toBe('My goal is: launch')
    expect(() => buildSuiteUserMessage('   ')).toThrow(/describe your goal/i)
    expect(() => buildSuiteUserMessage(null)).toThrow(/describe your goal/i)
    expect(buildSuiteUserMessage('x'.repeat(2000))).toHaveLength('My goal is: '.length + 1000)
  })

  it('pairs unknown providers with a working model', () => {
    expect(resolveSuiteModel('openrouter')).toEqual({ provider: 'openai', model: 'gpt-4o-mini' })
    expect(resolveSuiteModel('gemini')).toEqual({ provider: 'gemini', model: 'gemini-2.5-flash' })
  })

  it('sends the guarded message and model', async () => {
    streamAgent.mockResolvedValue({ content: '{"title":"T","description":"d","agents":[]}', duration: 1 })
    await generateCustomSuite('  launch a thing  ', 'k', 'openrouter')
    expect(streamAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'openai',
        model: 'gpt-4o-mini',
        userMessage: 'My goal is: launch a thing',
      })
    )
  })
})
