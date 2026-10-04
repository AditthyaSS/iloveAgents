import { describe, it, expect } from 'vitest'
import { sanitizeAgentConfig } from './marketplace'

describe('sanitizeAgentConfig — immutability guarantees', () => {
  it('does not mutate the original config object', () => {
    const original = { name: 'Agent', api_key: 'sk-secret', temperature: 0.7 }
    const originalCopy = { ...original }
    sanitizeAgentConfig(original)
    expect(original).toEqual(originalCopy)
    expect(original.api_key).toBe('sk-secret')
  })

  it('returns a new object (not the same reference)', () => {
    const original = { name: 'Agent' }
    const { config } = sanitizeAgentConfig(original)
    expect(config).not.toBe(original)
  })

  it('nested objects are also not mutated', () => {
    const original = { settings: { api_key: 'sk-secret', model: 'gpt-4o' } }
    const originalApiKey = original.settings.api_key
    sanitizeAgentConfig(original)
    expect(original.settings.api_key).toBe(originalApiKey)
  })

  it('returns sanitized config as a new nested object', () => {
    const original = { settings: { api_key: 'sk-secret' } }
    const { config } = sanitizeAgentConfig(original)
    expect(config.settings).not.toBe(original.settings)
  })

  it('sanitizes to placeholder not empty string', () => {
    const { config } = sanitizeAgentConfig({ api_key: 'my-secret' })
    expect(config.api_key).not.toBe('')
    expect(config.api_key).not.toBe('my-secret')
    expect(typeof config.api_key).toBe('string')
  })

  it('placeholder contains field name information', () => {
    const { config } = sanitizeAgentConfig({ openai_api_key: 'sk-test' })
    expect(config.openai_api_key.includes('OPENAI_API_KEY')).toBe(true)
  })
})
