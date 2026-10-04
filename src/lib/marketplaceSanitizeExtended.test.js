import { describe, it, expect } from 'vitest'
import { sanitizeAgentConfig, MARKETPLACE_CATEGORIES } from './marketplace'

describe('sanitizeAgentConfig — comprehensive credential detection', () => {
  const CREDENTIAL_FIELDS = ['api_key', 'apiKey', 'token', 'secret', 'password', 'credential', 'auth']

  CREDENTIAL_FIELDS.forEach((field) => {
    it(`sanitizes field: ${field}`, () => {
      const { config, sanitizedFields } = sanitizeAgentConfig({ [field]: 'secret123' })
      expect(config[field]).toContain('HERE')
      expect(sanitizedFields).toContain(field)
    })
  })

  it('does not sanitize empty string value', () => {
    const { config } = sanitizeAgentConfig({ api_key: '' })
    expect(config.api_key).toBe('')
  })

  it('sanitizes deeply nested credential', () => {
    const { config } = sanitizeAgentConfig({
      provider: {
        settings: {
          api_key: 'sk-secret',
        },
      },
    })
    expect(config.provider.settings.api_key).toContain('HERE')
  })

  it('preserves array values', () => {
    const { config } = sanitizeAgentConfig({ tags: ['a', 'b', 'c'] })
    expect(config.tags).toEqual(['a', 'b', 'c'])
  })

  it('handles null values without error', () => {
    const { config } = sanitizeAgentConfig({ name: null })
    expect(config.name).toBeNull()
  })

  it('does not mutate original config', () => {
    const original = { name: 'Agent', api_key: 'secret' }
    sanitizeAgentConfig(original)
    expect(original.api_key).toBe('secret')
  })
})

describe('MARKETPLACE_CATEGORIES', () => {
  it('contains Data Processing', () => {
    expect(MARKETPLACE_CATEGORIES).toContain('Data Processing')
  })

  it('contains Content Generation', () => {
    expect(MARKETPLACE_CATEGORIES).toContain('Content Generation')
  })

  it('contains Research', () => {
    expect(MARKETPLACE_CATEGORIES).toContain('Research')
  })

  it('has no duplicate categories', () => {
    const unique = new Set(MARKETPLACE_CATEGORIES)
    expect(unique.size).toBe(MARKETPLACE_CATEGORIES.length)
  })
})
