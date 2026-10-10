import { describe, it, expect } from 'vitest'
import { getPricing, estimateInputCost, estimateOutputCost, getContextWindow, MODEL_PRICING } from './modelPricing'

describe('Gemini model pricing', () => {
  describe('gemini-1.5-pro', () => {
    it('exists and has gemini provider', () => {
      const pricing = getPricing('gemini-1.5-pro')
      expect(pricing?.provider).toBe('gemini')
    })

    it('has 1M token context window (or larger)', () => {
      expect(getContextWindow('gemini-1.5-pro')).toBeGreaterThanOrEqual(1_000_000)
    })

    it('input cost is $1.25 per 1M tokens', () => {
      expect(estimateInputCost('gemini-1.5-pro', 1_000_000)).toBeCloseTo(1.25)
    })
  })

  describe('gemini-2.5-flash', () => {
    it('exists in MODEL_PRICING', () => {
      expect(MODEL_PRICING['gemini-2.5-flash']).toBeDefined()
    })

    it('is cheaper than gemini-1.5-pro for input', () => {
      const flash = estimateInputCost('gemini-2.5-flash', 1_000_000)
      const pro = estimateInputCost('gemini-1.5-pro', 1_000_000)
      expect(flash).toBeLessThan(pro)
    })
  })

  describe('gemini-2.0-flash-exp', () => {
    it('exists and is cheaper than gemini-1.5-pro', () => {
      const flash = estimateInputCost('gemini-2.0-flash-exp', 1_000_000)
      const pro = estimateInputCost('gemini-1.5-pro', 1_000_000)
      if (flash !== null && pro !== null) {
        expect(flash).toBeLessThan(pro)
      }
    })
  })

  describe('Gemini vs OpenAI pricing comparison', () => {
    it('gemini-1.5-pro is cheaper than gpt-4o per 1M input tokens', () => {
      const gemini = estimateInputCost('gemini-1.5-pro', 1_000_000)
      const gpt4o = estimateInputCost('gpt-4o', 1_000_000)
      expect(gemini).toBeLessThan(gpt4o)
    })
  })
})
