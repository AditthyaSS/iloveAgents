import { describe, it, expect } from 'vitest'
import { getPricing, estimateInputCost, estimateOutputCost, getContextWindow, MODEL_PRICING } from './modelPricing'

describe('modelPricing — final complete coverage', () => {
  describe('All provider first models accessible', () => {
    const FIRST_MODELS = {
      openai: 'gpt-4o',
      anthropic: 'claude-3-5-sonnet-20241022',
      gemini: 'gemini-2.5-flash',
    }

    Object.entries(FIRST_MODELS).forEach(([provider, modelId]) => {
      it(`${provider}: ${modelId} accessible via getPricing`, () => {
        const pricing = getPricing(modelId)
        expect(pricing).not.toBeNull()
        expect(pricing.provider).toBe(provider)
      })
    })
  })

  describe('Cost calculation accuracy', () => {
    it('gpt-4o: $2.50 per 1M input tokens', () => {
      expect(estimateInputCost('gpt-4o', 1_000_000)).toBeCloseTo(2.5)
    })

    it('gpt-4o: $10.00 per 1M output tokens', () => {
      expect(estimateOutputCost('gpt-4o', 1_000_000)).toBeCloseTo(10.0)
    })

    it('claude-3-5-haiku: $0.80 per 1M input tokens', () => {
      expect(estimateInputCost('claude-3-5-haiku-20241022', 1_000_000)).toBeCloseTo(0.8)
    })

    it('gemini-1.5-pro: $1.25 per 1M input tokens', () => {
      expect(estimateInputCost('gemini-1.5-pro', 1_000_000)).toBeCloseTo(1.25)
    })
  })

  describe('Context window values', () => {
    it('gpt-4o context window is 128000', () => {
      expect(getContextWindow('gpt-4o')).toBe(128000)
    })

    it('claude models have 200000 context window', () => {
      expect(getContextWindow('claude-3-5-sonnet-20241022')).toBe(200000)
    })

    it('gemini-1.5-pro has >= 1M context window', () => {
      expect(getContextWindow('gemini-1.5-pro')).toBeGreaterThanOrEqual(1_000_000)
    })
  })

  describe('Edge cases', () => {
    it('zero tokens gives $0', () => {
      expect(estimateInputCost('gpt-4o', 0)).toBe(0)
      expect(estimateOutputCost('gpt-4o', 0)).toBe(0)
    })

    it('getPricing: empty object key returns null', () => {
      expect(getPricing('')).toBeNull()
    })

    it('unknown model returns default 128000 context', () => {
      expect(getContextWindow('unknown-model-xyz')).toBe(128000)
    })
  })
})
