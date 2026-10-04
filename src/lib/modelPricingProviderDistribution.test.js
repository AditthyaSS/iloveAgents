import { describe, it, expect } from 'vitest'
import { MODEL_PRICING } from './modelPricing'

describe('MODEL_PRICING — provider distribution analysis', () => {
  const byProvider = Object.values(MODEL_PRICING).reduce((acc, m) => {
    acc[m.provider] = (acc[m.provider] || 0) + 1
    return acc
  }, {})

  it('has OpenAI models', () => expect(byProvider.openai).toBeGreaterThanOrEqual(3))
  it('has Anthropic models', () => expect(byProvider.anthropic).toBeGreaterThanOrEqual(3))
  it('has Gemini models', () => expect(byProvider.gemini).toBeGreaterThanOrEqual(3))
  it('has OpenRouter models', () => expect(byProvider.openrouter).toBeGreaterThanOrEqual(2))

  it('total model count reflects all providers', () => {
    const total = Object.values(byProvider).reduce((s, n) => s + n, 0)
    expect(total).toBe(Object.keys(MODEL_PRICING).length)
  })

  it('no unexpected providers', () => {
    const validProviders = new Set(['openai', 'anthropic', 'gemini', 'openrouter'])
    for (const provider of Object.keys(byProvider)) {
      expect(validProviders.has(provider)).toBe(true)
    }
  })

  it('output cost always >= input cost (all models)', () => {
    for (const [id, pricing] of Object.entries(MODEL_PRICING)) {
      expect(pricing.outputCostPer1M).toBeGreaterThanOrEqual(pricing.inputCostPer1M)
    }
  })
})
