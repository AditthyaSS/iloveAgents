import { describe, it, expect } from 'vitest'
import { getContextWindow, MODEL_PRICING } from './modelPricing'

describe('Context windows across all models', () => {
  it('gpt-4o has 128k context', () => expect(getContextWindow('gpt-4o')).toBe(128_000))
  it('gpt-4o-mini has 128k context', () => expect(getContextWindow('gpt-4o-mini')).toBe(128_000))
  it('o1-mini has 128k context', () => expect(getContextWindow('o1-mini')).toBe(128_000))
  it('o3-mini has 200k context', () => expect(getContextWindow('o3-mini')).toBe(200_000))
  it('claude-3-5-sonnet has 200k context', () => expect(getContextWindow('claude-3-5-sonnet-20241022')).toBe(200_000))
  it('claude-3-5-haiku has 200k context', () => expect(getContextWindow('claude-3-5-haiku-20241022')).toBe(200_000))
  it('claude-3-opus has 200k context', () => expect(getContextWindow('claude-3-opus-20240229')).toBe(200_000))
  it('gemini-1.5-pro has >= 1M context', () => expect(getContextWindow('gemini-1.5-pro')).toBeGreaterThanOrEqual(1_000_000))
  it('unknown model defaults to 128k', () => expect(getContextWindow('any-other-model')).toBe(128_000))

  it('o3-mini has larger context than o1-mini', () => {
    expect(getContextWindow('o3-mini')).toBeGreaterThan(getContextWindow('o1-mini'))
  })

  it('all gemini models have context window >= 128k', () => {
    const geminiModels = Object.entries(MODEL_PRICING).filter(([, p]) => p.provider === 'gemini')
    for (const [, pricing] of geminiModels) {
      expect(pricing.contextWindow).toBeGreaterThanOrEqual(128_000)
    }
  })
})
