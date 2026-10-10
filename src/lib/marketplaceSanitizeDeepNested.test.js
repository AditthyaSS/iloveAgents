import { describe, it, expect } from 'vitest'
import { sanitizeAgentConfig } from './marketplace'

describe('sanitizeAgentConfig — deeply nested structures', () => {
  it('sanitizes deeply nested credential', () => {
    const { config } = sanitizeAgentConfig({
      settings: { openai: { apiKey: 'sk-secret' } }
    })
    expect(config.settings.openai.apiKey).toContain('HERE')
  })

  it('preserves deeply nested non-credential', () => {
    const { config } = sanitizeAgentConfig({
      settings: { model: { name: 'gpt-4o', temperature: 0.7 } }
    })
    expect(config.settings.model.name).toBe('gpt-4o')
    expect(config.settings.model.temperature).toBe(0.7)
  })

  it('sanitizes multiple nested credentials at different depths', () => {
    const { config, sanitizedFields } = sanitizeAgentConfig({
      api_key: 'top-level-key',
      provider: { token: 'nested-token' }
    })
    expect(config.api_key).toContain('HERE')
    expect(config.provider.token).toContain('HERE')
    expect(sanitizedFields.length).toBe(2)
  })

  it('reports full dotted path for nested credentials', () => {
    const { sanitizedFields } = sanitizeAgentConfig({
      auth: { credentials: { password: 'secret' } }
    })
    const hasDottedPath = sanitizedFields.some((f) => f.includes('password'))
    expect(hasDottedPath).toBe(true)
  })

  it('handles null values in nested structure', () => {
    const { config } = sanitizeAgentConfig({
      settings: { api_key: null, name: 'test' }
    })
    expect(config.settings.name).toBe('test')
  })
})
