import { describe, it, expect, vi, afterEach } from 'vitest'
import { streamAgent } from './llmAdapter'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function sseChunk(obj) {
  return `data: ${JSON.stringify(obj)}\n\n`
}

describe('stream finish reasons', () => {
  it('ends on length finish and reports truncation-worthy done', async () => {
    const enc = new TextEncoder()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        body: new ReadableStream({
          start(c) {
            c.enqueue(enc.encode(sseChunk({ choices: [{ delta: { content: 'cut' } }] })))
            c.enqueue(
              enc.encode(sseChunk({ choices: [{ delta: {}, finish_reason: 'length' }] }))
            )
            // transport deliberately left open
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
    expect(result.content).toContain('cut')
  }, 10000)

  it('ends on gemini MAX_TOKENS', async () => {
    const enc = new TextEncoder()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        body: new ReadableStream({
          start(c) {
            c.enqueue(
              enc.encode(
                `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: 'half' }] }, finishReason: 'MAX_TOKENS' }] })}\n\n`
              )
            )
          },
        }),
      }))
    )
    const result = await streamAgent({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      apiKey: 'k',
      systemPrompt: 'sys',
      userMessage: 'hi',
      onChunk: () => {},
    })
    expect(result.content).toContain('half')
  }, 10000)
})
