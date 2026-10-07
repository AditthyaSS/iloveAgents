import { describe, it, expect, vi } from 'vitest'
import { generateCustomSuite } from './customSuiteGenerator'
import { analyseModels } from './modelAnalyser'

vi.mock('./llmAdapter', () => ({
  streamAgent: vi.fn(),
}))
vi.mock('./useAnalytics', () => ({
  recordAnalyticsRun: vi.fn(() => true),
}))

import { streamAgent } from './llmAdapter'

describe('suite JSON guards', () => {
  it('raises a readable error for non-JSON suite replies', async () => {
    streamAgent.mockResolvedValue({ content: 'Sure, here is some prose without JSON', duration: 1 })
    await expect(generateCustomSuite('plan a launch', 'k', 'openai')).rejects.toThrow(
      /unreadable reply/
    )
  })

  it('builds model analysis context without a system prompt', async () => {
    streamAgent.mockResolvedValue({ content: '## Model Recommendations', duration: 1 })
    await expect(
      analyseModels({ name: 'A', description: 'd' }, 'k', 'openai')
    ).resolves.not.toThrow()
  })
})
