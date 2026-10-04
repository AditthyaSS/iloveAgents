import { describe, it, expect } from 'vitest'
import { estimateInputCost, estimateOutputCost, MODEL_PRICING } from './modelPricing'

describe('modelPricing — input/output cost ratios', () => {
  describe('All models have output >= input cost', () => {
    Object.keys(MODEL_PRICING).forEach((modelId) => {
      it(`${modelId}: output >= input per 1M tokens`, () => {
        const input = estimateInputCost(modelId, 1_000_000)
        const output = estimateOutputCost(modelId, 1_000_000)
        expect(output).toBeGreaterThanOrEqual(input)
      })
    })
  })

  describe('Cost ratio verification for known models', () => {
    it('gpt-4o: output is 4x input', () => {
      const input = estimateInputCost('gpt-4o', 1_000_000)
      const output = estimateOutputCost('gpt-4o', 1_000_000)
      expect(output / input).toBeCloseTo(4, 0)
    })

    it('claude-3-5-sonnet: output is 5x input', () => {
      const input = estimateInputCost('claude-3-5-sonnet-20241022', 1_000_000)
      const output = estimateOutputCost('claude-3-5-sonnet-20241022', 1_000_000)
      expect(output / input).toBeCloseTo(5, 0)
    })

    it('gpt-4o-mini: output is 4x input', () => {
      const input = estimateInputCost('gpt-4o-mini', 1_000_000)
      const output = estimateOutputCost('gpt-4o-mini', 1_000_000)
      expect(output / input).toBeCloseTo(4, 0)
    })
  })
})
