import { describe, it, expect } from 'vitest'
import { estimateInputCost, estimateOutputCost, getPricing } from './modelPricing'

describe('modelPricing — zero and boundary token counts', () => {
  const models = ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet-20241022', 'gemini-1.5-pro']

  models.forEach((modelId) => {
    it(`${modelId}: 0 input tokens = $0`, () => {
      expect(estimateInputCost(modelId, 0)).toBe(0)
    })

    it(`${modelId}: 0 output tokens = $0`, () => {
      expect(estimateOutputCost(modelId, 0)).toBe(0)
    })
  })

  it('1 token costs a tiny positive amount for gpt-4o', () => {
    const cost = estimateInputCost('gpt-4o', 1)
    expect(cost).toBeGreaterThan(0)
    expect(cost).toBeLessThan(0.01)
  })

  it('getPricing null for undefined', () => {
    expect(getPricing(undefined)).toBeNull()
  })

  it('getPricing null for null', () => {
    expect(getPricing(null)).toBeNull()
  })

  it('estimateInputCost returns null for null model', () => {
    expect(estimateInputCost(null, 1000)).toBeNull()
  })

  it('estimateOutputCost returns null for null model', () => {
    expect(estimateOutputCost(null, 1000)).toBeNull()
  })
})
