import { describe, it, expect } from 'vitest'
import { estimateInputCost, estimateOutputCost } from './modelPricing'

describe('Cost calculator scenarios', () => {
  describe('Small request (1000 tokens in, 500 tokens out)', () => {
    it('gpt-4o total ≈ $0.0075', () => {
      const total = estimateInputCost('gpt-4o', 1000) + estimateOutputCost('gpt-4o', 500)
      expect(total).toBeCloseTo(0.0075)
    })

    it('gpt-4o-mini total ≈ $0.000450', () => {
      const total = estimateInputCost('gpt-4o-mini', 1000) + estimateOutputCost('gpt-4o-mini', 500)
      expect(total).toBeCloseTo(0.00045)
    })
  })

  describe('Medium request (10k tokens in, 2k tokens out)', () => {
    it('claude-3-5-sonnet total ≈ $0.060', () => {
      const input = estimateInputCost('claude-3-5-sonnet-20241022', 10_000)
      const output = estimateOutputCost('claude-3-5-sonnet-20241022', 2_000)
      const total = input + output
      expect(total).toBeCloseTo(0.06)
    })
  })

  describe('Large request (100k tokens in, 10k tokens out)', () => {
    it('gemini-1.5-pro is cheaper than gpt-4o for large inputs', () => {
      const gemini = estimateInputCost('gemini-1.5-pro', 100_000)
      const gpt4o = estimateInputCost('gpt-4o', 100_000)
      expect(gemini).toBeLessThan(gpt4o)
    })
  })

  describe('Zero-cost edge cases', () => {
    it('0 tokens = $0 for all models', () => {
      const models = ['gpt-4o', 'claude-3-5-sonnet-20241022', 'gemini-1.5-pro']
      for (const m of models) {
        expect(estimateInputCost(m, 0)).toBe(0)
        expect(estimateOutputCost(m, 0)).toBe(0)
      }
    })
  })
})
