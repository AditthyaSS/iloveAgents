import { describe, it, expect } from 'vitest'
import { getPricing, estimateInputCost, estimateOutputCost, getContextWindow, MODEL_PRICING } from './modelPricing'

describe('modelPricing — comprehensive final integration', () => {
  it('all models accessible via getPricing', () => {
    for (const modelId of Object.keys(MODEL_PRICING)) {
      const pricing = getPricing(modelId)
      expect(pricing).not.toBeNull()
    }
  })

  it('cost estimates are non-negative for all models', () => {
    for (const modelId of Object.keys(MODEL_PRICING)) {
      expect(estimateInputCost(modelId, 100_000)).toBeGreaterThanOrEqual(0)
      expect(estimateOutputCost(modelId, 100_000)).toBeGreaterThanOrEqual(0)
    }
  })

  it('context windows are reasonable (128k to 2M)', () => {
    for (const modelId of Object.keys(MODEL_PRICING)) {
      const ctx = getContextWindow(modelId)
      expect(ctx).toBeGreaterThanOrEqual(128_000)
      expect(ctx).toBeLessThanOrEqual(2_000_000)
    }
  })

  it('total cost computation for all models', () => {
    for (const modelId of Object.keys(MODEL_PRICING)) {
      const inputCost = estimateInputCost(modelId, 10_000)
      const outputCost = estimateOutputCost(modelId, 5_000)
      const total = inputCost + outputCost
      expect(total).toBeGreaterThan(0)
      expect(Number.isFinite(total)).toBe(true)
    }
  })
})
