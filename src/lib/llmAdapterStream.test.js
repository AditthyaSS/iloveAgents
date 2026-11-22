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

  it('propagates Anthropic mid-stream error events', async () => {
    const encoder = new TextEncoder()
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('data: {"type":"error","error":{"type":"overloaded_error","message":"Overloaded"}}\n\n'))
          controller.close()
        },
      }),
    })))

    await expect(streamAgent({
      provider: 'anthropic', model: 'claude-sonnet-5-5', apiKey: 'sk-test',
      systemPrompt: 'sys', userMessage: 'hi', onChunk: () => {},
    })).rejects.toThrow(/Overloaded/i)
  })

  it.each([
    ['openai', 'openai', 'OpenAI stream failed'],
    ['openrouter', 'openrouter', 'OpenRouter stream failed'],
    ['gemini', 'gemini', 'Gemini stream failed'],
  ])('propagates %s mid-stream provider errors', async (provider, _name, message) => {
    const encoder = new TextEncoder()
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: { message } })}\n\n`))
          controller.close()
        },
      }),
    })))

    await expect(streamAgent({
      provider, model: 'test-model', apiKey: 'test-key',
      systemPrompt: 'sys', userMessage: 'hi', onChunk: () => {},
    })).rejects.toThrow(new RegExp(message, 'i'))
  })
})
