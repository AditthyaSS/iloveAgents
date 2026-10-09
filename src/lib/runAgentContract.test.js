import { describe, it, expect, vi, afterEach } from 'vitest'
import { runAgent } from './llmAdapter'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('runAgent error contract', () => {
  it('throws real Errors with type metadata for bad keys', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'bad key', code: 401 } }),
      }))
    )
    const err = await runAgent({
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: 'sk-bad',
      systemPrompt: 'sys',
      userMessage: 'hi',
    }).catch((e) => e)
    expect(err).toBeInstanceOf(Error)
    expect(err.type).toBe('invalid_api_key')
    expect(err.message).toMatch(/bad key/)
  })

  it('rejects non-string keys and empty content', async () => {
    await expect(
      runAgent({ provider: 'openai', model: 'm', apiKey: 42, systemPrompt: 's', userMessage: 'hi' })
    ).rejects.toThrow(/api key/i)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ choices: [{ message: { content: '   ' } }] }),
      }))
    )
    await expect(
      runAgent({ provider: 'openai', model: 'm', apiKey: 'k', systemPrompt: 's', userMessage: 'hi' })
    ).rejects.toThrow(/empty response/i)
  })
})
