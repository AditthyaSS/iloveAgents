import { describe, it, expect, vi } from 'vitest'
import { analyseModels } from './modelAnalyser'
import { streamAgent } from './llmAdapter'

vi.mock('./llmAdapter', () => ({
  streamAgent: vi.fn(async () => ({ content: 'ok' })),
}))

const agent = { name: 'A', description: 'B', systemPrompt: 'Do things.' }

describe('analyseModels', () => {
  it('uses a valid openrouter default model', async () => {
    await analyseModels(agent, 'key', 'openrouter')
    expect(streamAgent).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'openrouter', model: 'openai/gpt-4o-mini' })
    )
  })

  it('tolerates a missing system prompt', async () => {
    await expect(
      analyseModels({ name: 'A', description: 'B' }, 'key', 'openai')
    ).resolves.toBe('ok')
    expect(streamAgent).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'openai', model: 'gpt-4o-mini' })
    )
  })
})
