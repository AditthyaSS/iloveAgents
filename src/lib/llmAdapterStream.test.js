import { describe, it, expect, vi, afterEach } from 'vitest'
import { streamAgent } from './llmAdapter'

describe('streamAgent response body', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('throws a clear error when the body is missing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, body: null })))
    await expect(
      streamAgent({
        provider: 'openai',
        model: 'gpt-4o-mini',
        apiKey: 'sk-test',
        systemPrompt: 'sys',
        userMessage: 'hi',
        onChunk: () => {},
      })
    ).rejects.toThrow(/streaming is not supported/i)
  })

  it('throws a clear error when getReader is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, body: {} })))
    await expect(
      streamAgent({
        provider: 'openai',
        model: 'gpt-4o-mini',
        apiKey: 'sk-test',
        systemPrompt: 'sys',
        userMessage: 'hi',
        onChunk: () => {},
      })
    ).rejects.toThrow(/streaming is not supported/i)
  })
})
