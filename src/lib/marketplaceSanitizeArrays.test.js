import { describe, it, expect } from 'vitest'
import { sanitizeAgentConfig } from './marketplace'

describe('sanitizeAgentConfig — array handling', () => {
  it('handles array of objects with credential fields', () => {
    const { config } = sanitizeAgentConfig({
      providers: [
        { name: 'openai', api_key: 'sk-secret1' },
        { name: 'anthropic', api_key: 'sk-secret2' },
      ]
    })
    expect(config.providers[0].api_key).toContain('HERE')
    expect(config.providers[1].api_key).toContain('HERE')
  })

  it('preserves non-credential fields in array of objects', () => {
    const { config } = sanitizeAgentConfig({
      providers: [{ name: 'openai', api_key: 'sk-secret' }]
    })
    expect(config.providers[0].name).toBe('openai')
  })

  it('handles empty array', () => {
    const { config } = sanitizeAgentConfig({ items: [] })
    expect(config.items).toEqual([])
  })

  it('handles array of strings', () => {
    const { config } = sanitizeAgentConfig({ tags: ['a', 'b', 'c'] })
    expect(config.tags).toEqual(['a', 'b', 'c'])
  })

  it('handles deeply nested array with credential', () => {
    const { config } = sanitizeAgentConfig({
      level1: { level2: { items: [{ token: 'secret' }] } }
    })
    expect(config.level1.level2.items[0].token).toContain('HERE')
  })

  it('reports credential path in sanitizedFields for array item', () => {
    const { sanitizedFields } = sanitizeAgentConfig({
      providers: [{ api_key: 'sk-test' }]
    })
    expect(sanitizedFields.some((f) => f.includes('api_key'))).toBe(true)
  })
})
