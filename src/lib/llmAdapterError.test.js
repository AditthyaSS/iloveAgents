// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest'
import { runAgent, streamAgent } from './llmAdapter'

describe('llmAdapter error handling for 401 and HTTP errors', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('throws an Error instance on 401 with type, provider, detail, and informative message for runAgent', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: { message: 'Incorrect API key provided' },
      }),
    })

    let caughtError = null
    try {
      await runAgent({
        provider: 'openai',
        model: 'gpt-4o-mini',
        apiKey: 'sk-invalid',
        systemPrompt: 'You are helpful',
        userMessage: 'Test prompt',
      })
    } catch (err) {
      caughtError = err
    }

    expect(caughtError).not.toBeNull()
    expect(caughtError).toBeInstanceOf(Error)
    expect(caughtError.type).toBe('invalid_api_key')
    expect(caughtError.provider).toBe('openai')
    expect(caughtError.detail).toBe('Incorrect API key provided')
    expect(caughtError.message).toContain('Invalid API key for openai: Incorrect API key provided')
  })

  it('throws an Error instance on 401 for streamAgent', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: { message: 'Expired credentials' },
      }),
    })

    let caughtError = null
    try {
      await streamAgent({
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        apiKey: 'sk-ant-invalid',
        systemPrompt: 'sys',
        userMessage: 'hi',
        onChunk: () => {},
      })
    } catch (err) {
      caughtError = err
    }

    expect(caughtError).not.toBeNull()
    expect(caughtError).toBeInstanceOf(Error)
    expect(caughtError.type).toBe('invalid_api_key')
    expect(caughtError.provider).toBe('anthropic')
    expect(caughtError.detail).toBe('Expired credentials')
    expect(caughtError.message).toContain('Invalid API key for anthropic: Expired credentials')
  })

  it('handles 401 when error body is not JSON or empty', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => {
        throw new Error('Not JSON')
      },
    })

    let caughtError = null
    try {
      await runAgent({
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        apiKey: 'invalid-key',
        systemPrompt: 'sys',
        userMessage: 'hi',
      })
    } catch (err) {
      caughtError = err
    }

    expect(caughtError).toBeInstanceOf(Error)
    expect(caughtError.type).toBe('invalid_api_key')
    expect(caughtError.provider).toBe('gemini')
    expect(caughtError.detail).toBe('No additional details')
    expect(caughtError.message).toContain('Invalid API key for gemini. Please check your API key in Settings.')
  })

  it('throws an Error on non-401 HTTP errors (e.g. 429)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        error: { message: 'Quota exceeded for current quota period' },
      }),
    })

    let caughtError = null
    try {
      await runAgent({
        provider: 'openrouter',
        model: 'openai/gpt-4o-mini',
        apiKey: 'sk-or-valid',
        systemPrompt: 'sys',
        userMessage: 'hi',
      })
    } catch (err) {
      caughtError = err
    }

    expect(caughtError).toBeInstanceOf(Error)
    expect(caughtError.message).toContain('Rate limit hit')
    expect(caughtError.message).toContain('Quota exceeded for current quota period')
  })
})
