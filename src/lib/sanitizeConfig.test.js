import { describe, it, expect } from 'vitest'
import { sanitizeAgentConfig } from './marketplace'

describe('sanitizeAgentConfig', () => {
  it('replaces top level credential values with placeholders', () => {
    const { config, sanitizedFields } = sanitizeAgentConfig({
      api_key: 'sk-live',
      name: 'My agent',
    })
    expect(config.api_key).toBe('YOUR_API_KEY_HERE')
    expect(config.name).toBe('My agent')
    expect(sanitizedFields).toEqual(['api_key'])
  })

  it('walks nested objects and arrays', () => {
    const { config, sanitizedFields } = sanitizeAgentConfig({
      nested: { token: 'abc', safe: 'ok' },
      list: [{ secret: 's1' }, { other: 'o' }],
    })
    expect(config.nested.token).toBe('YOUR_TOKEN_HERE')
    expect(config.nested.safe).toBe('ok')
    expect(config.list[0].secret).toBe('YOUR_SECRET_HERE')
    expect(config.list[1]).toEqual({ other: 'o' })
    expect(sanitizedFields).toContain('nested.token')
    expect(sanitizedFields).toContain('list[0].secret')
  })

  it('ignores empty credential values', () => {
    const { config, sanitizedFields } = sanitizeAgentConfig({ api_key: '' })
    expect(config.api_key).toBe('')
    expect(sanitizedFields).toEqual([])
  })

  it('passes clean configs through untouched', () => {
    const input = { model: 'gpt-4o', retries: 3 }
    const { config, sanitizedFields } = sanitizeAgentConfig(input)
    expect(config).toEqual(input)
    expect(sanitizedFields).toEqual([])
  })
})
