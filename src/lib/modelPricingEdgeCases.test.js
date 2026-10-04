import { describe, it, expect } from 'vitest'
import { getPricing, estimateInputCost, estimateOutputCost, getContextWindow, MODEL_PRICING } from './modelPricing'

describe('modelPricing — edge cases and all models', () => {
  describe('estimateInputCost precision', () => {
    it('returns exact cost for exactly 1M tokens (gpt-4o-mini)', () => {
      expect(estimateInputCost('gpt-4o-mini', 1_000_000)).toBeCloseTo(0.15)
    })

    it('returns very small cost for 1000 tokens', () => {
      const cost = estimateInputCost('gpt-4o', 1000)
      expect(cost).toBeCloseTo(0.0025)
    })

    it('returns null for empty string model id', () => {
      expect(estimateInputCost('', 100_000)).toBeNull()
    })
  })

  describe('getContextWindow fallback', () => {
    it('returns 128000 as default for unknown model', () => {
      expect(getContextWindow('mystery-model')).toBe(128000)
    })

    it('returns same as MODEL_PRICING entry', () => {
      expect(getContextWindow('gpt-4o')).toBe(MODEL_PRICING['gpt-4o'].contextWindow)
    })
  })

  describe('estimateOutputCost for anthropic models', () => {
    it('Claude 3.5 Sonnet output costs $15 per 1M tokens', () => {
      expect(estimateOutputCost('claude-3-5-sonnet-20241022', 1_000_000)).toBeCloseTo(15.0)
    })

    it('Claude 3.5 Haiku output is cheaper than Sonnet', () => {
      const haiku = estimateOutputCost('claude-3-5-haiku-20241022', 1_000_000)
      const sonnet = estimateOutputCost('claude-3-5-sonnet-20241022', 1_000_000)
      expect(haiku).toBeLessThan(sonnet)
    })
  })

  describe('OpenRouter models', () => {
    it('openrouter/gpt-4o-mini pricing exists', () => {
      expect(getPricing('openai/gpt-4o-mini')).not.toBeNull()
    })

    it('openrouter/claude-3.5-sonnet pricing exists', () => {
      expect(getPricing('anthropic/claude-3.5-sonnet')).not.toBeNull()
    })
  })

  describe('all MODEL_PRICING entries have valid context windows', () => {
    it('context windows are all positive integers', () => {
      for (const [modelId, pricing] of Object.entries(MODEL_PRICING)) {
        expect(pricing.contextWindow).toBeGreaterThan(0)
        expect(Number.isInteger(pricing.contextWindow)).toBe(true)
      }
    })
  })
})
