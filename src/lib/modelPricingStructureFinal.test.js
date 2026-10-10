import { describe, it, expect } from 'vitest'
import { MODEL_PRICING, getPricing, estimateInputCost } from './modelPricing'

describe('MODEL_PRICING — final structural validation', () => {
  it('every entry has all 4 required fields', () => {
    for (const [id, pricing] of Object.entries(MODEL_PRICING)) {
      expect(pricing, `${id} missing provider`).toHaveProperty('provider')
      expect(pricing, `${id} missing inputCostPer1M`).toHaveProperty('inputCostPer1M')
      expect(pricing, `${id} missing outputCostPer1M`).toHaveProperty('outputCostPer1M')
      expect(pricing, `${id} missing contextWindow`).toHaveProperty('contextWindow')
    }
  })

  it('all providers are one of: openai, anthropic, gemini, openrouter', () => {
    const validProviders = new Set(['openai', 'anthropic', 'gemini', 'openrouter'])
    for (const pricing of Object.values(MODEL_PRICING)) {
      expect(validProviders.has(pricing.provider)).toBe(true)
    }
  })

  it('all context windows are multiples of 1000', () => {
    for (const [id, pricing] of Object.entries(MODEL_PRICING)) {
      expect(pricing.contextWindow % 1000, `${id} context window not multiple of 1000`).toBe(0)
    }
  })

  it('output cost is always >= input cost for all models', () => {
    for (const [id, pricing] of Object.entries(MODEL_PRICING)) {
      expect(pricing.outputCostPer1M, `${id} output < input`).toBeGreaterThanOrEqual(pricing.inputCostPer1M)
    }
  })

  it('getPricing returns null for non-existent model', () => {
    expect(getPricing('model-that-does-not-exist')).toBeNull()
  })
})
