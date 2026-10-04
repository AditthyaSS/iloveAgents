import { describe, it, expect } from 'vitest'
import { MODEL_PRICING, getPricing } from './modelPricing'

describe('MODEL_PRICING — complete provider coverage', () => {
  const PROVIDER_COUNTS = { openai: 0, anthropic: 0, gemini: 0, openrouter: 0 }

  for (const m of Object.values(MODEL_PRICING)) {
    if (m.provider in PROVIDER_COUNTS) PROVIDER_COUNTS[m.provider]++
  }

  it('has openai models', () => expect(PROVIDER_COUNTS.openai).toBeGreaterThan(0))
  it('has anthropic models', () => expect(PROVIDER_COUNTS.anthropic).toBeGreaterThan(0))
  it('has gemini models', () => expect(PROVIDER_COUNTS.gemini).toBeGreaterThan(0))
  it('has openrouter models', () => expect(PROVIDER_COUNTS.openrouter).toBeGreaterThan(0))

  it('all models have valid inputCostPer1M > 0', () => {
    for (const m of Object.values(MODEL_PRICING)) {
      expect(m.inputCostPer1M).toBeGreaterThan(0)
    }
  })

  it('all models have valid outputCostPer1M > 0', () => {
    for (const m of Object.values(MODEL_PRICING)) {
      expect(m.outputCostPer1M).toBeGreaterThan(0)
    }
  })

  it('all models have contextWindow >= 4096', () => {
    for (const m of Object.values(MODEL_PRICING)) {
      expect(m.contextWindow).toBeGreaterThanOrEqual(4096)
    }
  })

  it('all model IDs are non-empty strings', () => {
    for (const key of Object.keys(MODEL_PRICING)) {
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThan(0)
    }
  })

  it('total model count is at least 10', () => {
    expect(Object.keys(MODEL_PRICING).length).toBeGreaterThanOrEqual(10)
  })

  it('getPricing returns null for empty string', () => {
    expect(getPricing('')).toBeNull()
  })
})
