import { describe, it, expect } from 'vitest'
import { sanitizeAgentConfig } from './marketplace'

describe('sanitizeAgentConfig — return type and structure', () => {
  it('returns object with exactly "config" and "sanitizedFields" keys', () => {
    const result = sanitizeAgentConfig({ name: 'test' })
    expect(Object.keys(result).sort()).toEqual(['config', 'sanitizedFields'])
  })

  it('config is always an object', () => {
    const { config } = sanitizeAgentConfig({})
    expect(typeof config).toBe('object')
    expect(config).not.toBeNull()
  })

  it('sanitizedFields is always an array', () => {
    expect(Array.isArray(sanitizeAgentConfig({}).sanitizedFields)).toBe(true)
    expect(Array.isArray(sanitizeAgentConfig({ api_key: 'x' }).sanitizedFields)).toBe(true)
  })

  it('sanitizedFields.length = 0 when no credentials', () => {
    expect(sanitizeAgentConfig({ name: 'test', model: 'gpt' }).sanitizedFields).toHaveLength(0)
  })

  it('sanitizedFields.length > 0 when credentials present', () => {
    expect(sanitizeAgentConfig({ api_key: 'sk-test' }).sanitizedFields.length).toBeGreaterThan(0)
  })

  it('config preserves all non-credential keys', () => {
    const { config } = sanitizeAgentConfig({ name: 'Agent', temperature: 0.7, maxTokens: 1000 })
    expect(config.name).toBe('Agent')
    expect(config.temperature).toBe(0.7)
    expect(config.maxTokens).toBe(1000)
  })

  it('config.api_key is a non-empty string when sanitized', () => {
    const { config } = sanitizeAgentConfig({ api_key: 'sk-secret' })
    expect(typeof config.api_key).toBe('string')
    expect(config.api_key.length).toBeGreaterThan(0)
  })
})
