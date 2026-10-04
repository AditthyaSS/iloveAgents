import { describe, it, expect } from 'vitest'
import { estimateInputCost, estimateOutputCost } from './modelPricing'

describe('Batch cost estimation scenarios', () => {
  describe('10-item batch: 500 tokens input, 200 tokens output each', () => {
    const BATCH_SIZE = 10
    const INPUT_PER_ITEM = 500
    const OUTPUT_PER_ITEM = 200

    it('gpt-4o-mini total batch cost is very small (< $0.01)', () => {
      const totalInput = estimateInputCost('gpt-4o-mini', BATCH_SIZE * INPUT_PER_ITEM)
      const totalOutput = estimateOutputCost('gpt-4o-mini', BATCH_SIZE * OUTPUT_PER_ITEM)
      expect(totalInput + totalOutput).toBeLessThan(0.01)
    })

    it('claude-3-5-haiku total batch cost is affordable (< $0.05)', () => {
      const totalInput = estimateInputCost('claude-3-5-haiku-20241022', BATCH_SIZE * INPUT_PER_ITEM)
      const totalOutput = estimateOutputCost('claude-3-5-haiku-20241022', BATCH_SIZE * OUTPUT_PER_ITEM)
      expect(totalInput + totalOutput).toBeLessThan(0.05)
    })
  })

  describe('1000-item batch: 1000 tokens input, 500 tokens output each', () => {
    const BATCH_SIZE = 1000
    const INPUT_PER_ITEM = 1000
    const OUTPUT_PER_ITEM = 500

    it('gpt-4o is more expensive than gpt-4o-mini for large batch', () => {
      const gpt4oCost = estimateInputCost('gpt-4o', BATCH_SIZE * INPUT_PER_ITEM)
      const miniCost = estimateInputCost('gpt-4o-mini', BATCH_SIZE * INPUT_PER_ITEM)
      expect(gpt4oCost).toBeGreaterThan(miniCost)
    })

    it('all costs are finite positive numbers', () => {
      const models = ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-haiku-20241022', 'gemini-2.5-flash']
      for (const m of models) {
        const total = estimateInputCost(m, BATCH_SIZE * INPUT_PER_ITEM) +
                      estimateOutputCost(m, BATCH_SIZE * OUTPUT_PER_ITEM)
        expect(Number.isFinite(total)).toBe(true)
        expect(total).toBeGreaterThan(0)
      }
    })
  })
})
