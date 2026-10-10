import { describe, it, expect } from 'vitest'
import { providerLabels, formatProvider, getCategoryMeta, defaultCategoryMeta } from './agentMeta'

describe('agentMeta', () => {
  it('labels every known provider', () => {
    for (const p of ['openai', 'anthropic', 'gemini', 'openrouter', 'any']) {
      expect(typeof providerLabels[p]).toBe('string')
    }
  })

  it('falls back to Any Provider for unknown ids', () => {
    expect(formatProvider('openai')).toBe('OpenAI')
    expect(formatProvider('nope')).toBe('Any Provider')
    expect(formatProvider(undefined)).toBe('Any Provider')
  })

  it('resolves known categories and defaults the rest', () => {
    expect(getCategoryMeta('Engineering').color).toContain('emerald')
    expect(getCategoryMeta('Nope')).toEqual(defaultCategoryMeta)
  })
})
