import { describe, it, expect } from 'vitest'
import { getPricing, estimateInputCost, estimateOutputCost, MODEL_PRICING } from './modelPricing'

describe('OpenRouter model pricing', () => {
  describe('openrouter/gpt-4o-mini pricing', () => {
    const modelId = 'openai/gpt-4o-mini'

    it('exists in MODEL_PRICING', () => {
      expect(MODEL_PRICING[modelId]).toBeDefined()
    })

    it('provider is openrouter', () => {
      expect(getPricing(modelId)?.provider).toBe('openrouter')
    })

    it('input cost per 1M is 0.15', () => {
      expect(estimateInputCost(modelId, 1_000_000)).toBeCloseTo(0.15)
    })
  })

  describe('openrouter Claude 3.5 Sonnet pricing', () => {
    const modelId = 'anthropic/claude-3.5-sonnet'

    it('exists in MODEL_PRICING', () => {
      expect(MODEL_PRICING[modelId]).toBeDefined()
    })

    it('provider is openrouter', () => {
      expect(getPricing(modelId)?.provider).toBe('openrouter')
    })

    it('output cost per 1M is 15', () => {
      expect(estimateOutputCost(modelId, 1_000_000)).toBeCloseTo(15.0)
    })
  })

  describe('openrouter model availability', () => {
    it('all openrouter models accessible via getPricing', () => {
      const openrouterModels = Object.entries(MODEL_PRICING)
        .filter(([, v]) => v.provider === 'openrouter')
        .map(([k]) => k)

      expect(openrouterModels.length).toBeGreaterThan(0)
      for (const modelId of openrouterModels) {
        expect(getPricing(modelId)).not.toBeNull()
      }
    })

    it('openrouter models have valid context windows', () => {
      const openrouterModels = Object.values(MODEL_PRICING)
        .filter((m) => m.provider === 'openrouter')

      for (const m of openrouterModels) {
        expect(m.contextWindow).toBeGreaterThan(0)
        expect(Number.isInteger(m.contextWindow)).toBe(true)
      }
    })
  })
})
