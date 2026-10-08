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

  it('exits when DONE arrives even if the transport stays open', async () => {
    const enc = new TextEncoder()
    const sse = (obj) => `data: ${JSON.stringify(obj)}\n\n`
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        body: new ReadableStream({
          start(c) {
            c.enqueue(enc.encode(sse({ choices: [{ delta: { content: 'hi' } }] })))
            c.enqueue(enc.encode('data: [DONE]\n\n'))
            // transport deliberately left open: old code hung here
          },
        }),
      }))
    )
    const result = await streamAgent({
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: 'sk-test',
      systemPrompt: 'sys',
      userMessage: 'hi',
      onChunk: () => {},
    })
    expect(result.content).toBe('hi')
  }, 10000)

  it('works without an onChunk callback', async () => {
    const enc = new TextEncoder()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        body: new ReadableStream({
          start(c) {
            c.enqueue(
              enc.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: 'yo' } }] })}\n\n`)
            )
            c.enqueue(enc.encode('data: [DONE]\n\n'))
            c.close()
          },
        }),
      }))
    )
    const result = await streamAgent({
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: 'sk-test',
      systemPrompt: 'sys',
      userMessage: 'hi',
    })
    expect(result.content).toBe('yo')
  })

  it('stops delivering chunks after abort and resolves partial content', async () => {
    const enc = new TextEncoder()
    const sse = (obj) => `data: ${JSON.stringify(obj)}\n\n`
    let pushMore
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url, init) => ({
        ok: true,
        body: new ReadableStream({
          start(c) {
            c.enqueue(enc.encode(sse({ choices: [{ delta: { content: 'one' } }] })))
            pushMore = () =>
              c.enqueue(enc.encode(sse({ choices: [{ delta: { content: 'two' } }] })))
            init.signal?.addEventListener('abort', () => {
              try {
                c.error(new DOMException('aborted', 'AbortError'))
              } catch {}
            })
          },
        }),
      }))
    )
    const controller = new AbortController()
    const seen = []
    const pending = streamAgent({
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: 'sk-test',
      systemPrompt: 'sys',
      userMessage: 'hi',
      onChunk: (c) => seen.push(c),
      signal: controller.signal,
    })
    await new Promise((r) => setTimeout(r, 20))
    controller.abort()
    await new Promise((r) => setTimeout(r, 20))
    try {
      pushMore?.()
    } catch {}
    await new Promise((r) => setTimeout(r, 20))
    const result = await pending
    expect(result.content).toContain('one')
    expect(seen).toEqual(['one'])
  }, 10000)
})
