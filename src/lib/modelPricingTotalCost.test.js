import { describe, it, expect } from 'vitest'
import { estimateInputCost, estimateOutputCost, getPricing } from './modelPricing'

describe('Combined cost calculations', () => {
  describe('Total request cost (input + output)', () => {
    it('gpt-4o: 1M input + 500k output', () => {
      const input = estimateInputCost('gpt-4o', 1_000_000)
      const output = estimateOutputCost('gpt-4o', 500_000)
      const total = input + output
      // 2.50 + 5.00 = 7.50
      expect(total).toBeCloseTo(7.50)
    })

    it('gpt-4o-mini is cheaper than gpt-4o for same workload', () => {
      const tokens = 1_000_000
      const gpt4oTotal = estimateInputCost('gpt-4o', tokens) + estimateOutputCost('gpt-4o', tokens)
      const miniTotal = estimateInputCost('gpt-4o-mini', tokens) + estimateOutputCost('gpt-4o-mini', tokens)
      expect(miniTotal).toBeLessThan(gpt4oTotal)
    })

    it('Claude 3 Opus is most expensive Anthropic model', () => {
      const tokens = 1_000_000
      const opus = estimateInputCost('claude-3-opus-20240229', tokens)
      const sonnet = estimateInputCost('claude-3-5-sonnet-20241022', tokens)
      const haiku = estimateInputCost('claude-3-5-haiku-20241022', tokens)
      expect(opus).toBeGreaterThan(sonnet)
      expect(sonnet).toBeGreaterThan(haiku)
    })

    it('Gemini 1.5 Pro is more expensive than Gemini 2.5 Flash for input', () => {
      const tokens = 1_000_000
      const pro = estimateInputCost('gemini-1.5-pro', tokens)
      const flash = estimateInputCost('gemini-2.5-flash', tokens)
      expect(pro).toBeGreaterThan(flash)
    })
  })

  describe('Provider pricing comparison', () => {
    it('all providers have at least one model with context window >= 128k', () => {
      const providers = ['openai', 'anthropic', 'gemini']
      for (const provider of providers) {
        const { MODEL_PRICING } = require('./modelPricing')
        const providerModels = Object.values(MODEL_PRICING).filter(m => m.provider === provider)
        expect(providerModels.some(m => m.contextWindow >= 128_000)).toBe(true)
      }
    })
  })
})
