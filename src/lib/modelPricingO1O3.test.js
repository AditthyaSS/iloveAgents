import { describe, it, expect } from 'vitest'
import { getPricing, estimateInputCost, estimateOutputCost, getContextWindow } from './modelPricing'

describe('OpenAI o1 and o3 reasoning model pricing', () => {
  describe('o1-mini', () => {
    it('exists with openai provider', () => {
      expect(getPricing('o1-mini')?.provider).toBe('openai')
    })

    it('input cost is $1.10 per 1M tokens', () => {
      expect(estimateInputCost('o1-mini', 1_000_000)).toBeCloseTo(1.10)
    })

    it('output cost is $4.40 per 1M tokens', () => {
      expect(estimateOutputCost('o1-mini', 1_000_000)).toBeCloseTo(4.40)
    })

    it('output is 4x input cost', () => {
      const input = estimateInputCost('o1-mini', 1_000_000)
      const output = estimateOutputCost('o1-mini', 1_000_000)
      expect(output / input).toBeCloseTo(4, 0)
    })
  })

  describe('o3-mini', () => {
    it('exists with openai provider', () => {
      expect(getPricing('o3-mini')?.provider).toBe('openai')
    })

    it('has same pricing as o1-mini', () => {
      const o1 = getPricing('o1-mini')
      const o3 = getPricing('o3-mini')
      expect(o3?.inputCostPer1M).toBe(o1?.inputCostPer1M)
      expect(o3?.outputCostPer1M).toBe(o1?.outputCostPer1M)
    })

    it('has larger context window than gpt-4o-mini', () => {
      expect(getContextWindow('o3-mini')).toBeGreaterThanOrEqual(getContextWindow('gpt-4o-mini'))
    })
  })

  describe('Reasoning model pricing comparison', () => {
    it('o1-mini is cheaper than gpt-4o for input', () => {
      expect(estimateInputCost('o1-mini', 1_000_000)).toBeLessThan(estimateInputCost('gpt-4o', 1_000_000))
    })

    it('o1-mini is more expensive than gpt-4o-mini for input', () => {
      expect(estimateInputCost('o1-mini', 1_000_000)).toBeGreaterThan(estimateInputCost('gpt-4o-mini', 1_000_000))
    })
  })
})
