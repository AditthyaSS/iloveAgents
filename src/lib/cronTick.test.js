import { describe, it, expect } from 'vitest'
import { buildCronRequest, parseCronResponse } from '../../api/cron/tick.js'

describe('buildCronRequest', () => {
  it('builds openai request by default', () => {
    const r = buildCronRequest('openai', 'sk-x', 'gpt-4o-mini', 'sys', 'hi')
    expect(r.url).toBe('https://api.openai.com/v1/chat/completions')
    expect(r.headers.Authorization).toBe('Bearer sk-x')
    expect(r.body.model).toBe('gpt-4o-mini')
  })

  it('builds anthropic request with right headers', () => {
    const r = buildCronRequest('anthropic', 'sk-ant', undefined, 'sys', 'hi')
    expect(r.url).toBe('https://api.anthropic.com/v1/messages')
    expect(r.headers['x-api-key']).toBe('sk-ant')
    expect(r.body.system).toBe('sys')
    expect(r.body.messages[0].role).toBe('user')
  })

  it('builds gemini request with key in url', () => {
    const r = buildCronRequest('gemini', 'g-key', 'gemini-2.5-flash', 'sys', 'hi')
    expect(r.url).toContain('generativelanguage.googleapis.com')
    expect(r.url).toContain('gemini-2.5-flash')
    expect(r.body.contents[0].parts[0].text).toContain('hi')
  })

  it('builds openrouter request with referer headers', () => {
    const r = buildCronRequest('openrouter', 'or-key', undefined, 'sys', 'hi')
    expect(r.url).toBe('https://openrouter.ai/api/v1/chat/completions')
    expect(r.headers['HTTP-Referer']).toBe('https://iloveagents.ai')
  })
})

describe('parseCronResponse', () => {
  it('parses openai choices', () => {
    const out = parseCronResponse('openai', { choices: [{ message: { content: 'hello' } }] })
    expect(out).toBe('hello')
  })

  it('parses anthropic content blocks', () => {
    const out = parseCronResponse('anthropic', { content: [{ text: 'hi from claude' }] })
    expect(out).toBe('hi from claude')
  })

  it('parses gemini candidates', () => {
    const out = parseCronResponse('gemini', {
      candidates: [{ content: { parts: [{ text: 'hi from gemini' }] } }],
    })
    expect(out).toBe('hi from gemini')
  })

  it('falls back when empty', () => {
    expect(parseCronResponse('openai', {})).toBe('No output generated')
  })
})
