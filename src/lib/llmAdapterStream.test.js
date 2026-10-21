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

function sseResponse(lines) {
  const encoder = new TextEncoder()
  const chunks = lines.map((line) => encoder.encode(`${line}\n\n`))
  let index = 0
  return {
    ok: true,
    body: {
      getReader: () => ({
        read: async () =>
          index < chunks.length ? { done: false, value: chunks[index++] } : { done: true },
      }),
    },
  }
}

describe('streamAgent mid-stream errors', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const run = (provider) =>
    streamAgent({
      provider,
      model: 'test-model',
      apiKey: 'sk-test',
      systemPrompt: 'sys',
      userMessage: 'hi',
      onChunk: () => {},
    })

  it('rejects with the message from an Anthropic error event', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => sseResponse([
      'event: content_block_delta',
      'data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hel"}}',
      'event: error',
      'data: {"type":"error","error":{"type":"overloaded_error","message":"Overloaded"}}',
    ])))
    await expect(run('anthropic')).rejects.toThrow('Overloaded')
  })

  it('rejects when an OpenAI-compatible stream sends an error payload', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => sseResponse([
      'data: {"choices":[{"delta":{"content":"Hel"}}]}',
      'data: {"error":{"code":502,"message":"Provider returned error"},"choices":[{"delta":{"content":""},"finish_reason":"error"}]}',
    ])))
    await expect(run('openrouter')).rejects.toThrow('Provider returned error')
  })

  it('rejects when a Gemini stream sends an error payload', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => sseResponse([
      'data: {"error":{"code":503,"message":"The model is overloaded."}}',
    ])))
    await expect(run('gemini')).rejects.toThrow('The model is overloaded.')
  })
})
