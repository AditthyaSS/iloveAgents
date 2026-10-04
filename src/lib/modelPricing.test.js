import { describe, it, expect } from 'vitest'
import {
  getPricing,
  estimateInputCost,
  estimateOutputCost,
  getContextWindow,
  MODEL_PRICING,
} from './modelPricing'

describe('getPricing', () => {
  it('returns pricing object for a known model', () => {
    const pricing = getPricing('gpt-4o')
    expect(pricing).not.toBeNull()
    expect(pricing).toHaveProperty('provider')
    expect(pricing).toHaveProperty('inputCostPer1M')
    expect(pricing).toHaveProperty('outputCostPer1M')
    expect(pricing).toHaveProperty('contextWindow')
  })

  it('returns null for an unknown model', () => {
    expect(getPricing('nonexistent-model-xyz')).toBeNull()
  })

  it('returns pricing for Claude 3.5 Sonnet', () => {
    const pricing = getPricing('claude-3-5-sonnet-20241022')
    expect(pricing).not.toBeNull()
    expect(pricing.provider).toBe('anthropic')
  })

  it('returns pricing for Gemini 1.5 Pro', () => {
    const pricing = getPricing('gemini-1.5-pro')
    expect(pricing).not.toBeNull()
    expect(pricing.provider).toBe('gemini')
  })
})

describe('estimateInputCost', () => {
  it('calculates correct cost for 1M tokens', () => {
    const cost = estimateInputCost('gpt-4o', 1_000_000)
    expect(cost).toBeCloseTo(2.50)
  })

  it('calculates correct cost for 100k tokens', () => {
    const cost = estimateInputCost('gpt-4o', 100_000)
    expect(cost).toBeCloseTo(0.25)
  })

  it('returns null for unknown model', () => {
    expect(estimateInputCost('unknown-model', 100_000)).toBeNull()
  })

  it('returns 0 for 0 tokens', () => {
    expect(estimateInputCost('gpt-4o', 0)).toBe(0)
  })
})

describe('estimateOutputCost', () => {
  it('calculates correct cost for 1M output tokens on gpt-4o', () => {
    const cost = estimateOutputCost('gpt-4o', 1_000_000)
    expect(cost).toBeCloseTo(10.00)
  })

  it('returns null for unknown model', () => {
    expect(estimateOutputCost('unknown-model', 1_000)).toBeNull()
  })

  it('output cost is higher than input cost for gpt-4o', () => {
    const tokens = 1_000_000
    expect(estimateOutputCost('gpt-4o', tokens)).toBeGreaterThan(estimateInputCost('gpt-4o', tokens))
  })
})

describe('getContextWindow', () => {
  it('returns context window for gpt-4o (128000)', () => {
    expect(getContextWindow('gpt-4o')).toBe(128000)
  })

  it('returns default 128000 for unknown model', () => {
    expect(getContextWindow('unknown-model')).toBe(128000)
  })

  it('returns large context for Claude models (200000)', () => {
    expect(getContextWindow('claude-3-5-sonnet-20241022')).toBe(200000)
  })
})

describe('MODEL_PRICING structure', () => {
  it('all entries have required fields', () => {
    for (const [modelId, pricing] of Object.entries(MODEL_PRICING)) {
      expect(pricing).toHaveProperty('provider')
      expect(pricing).toHaveProperty('inputCostPer1M')
      expect(pricing).toHaveProperty('outputCostPer1M')
      expect(pricing).toHaveProperty('contextWindow')
    }
  })

  it('all prices are positive numbers', () => {
    for (const pricing of Object.values(MODEL_PRICING)) {
      expect(pricing.inputCostPer1M).toBeGreaterThan(0)
      expect(pricing.outputCostPer1M).toBeGreaterThan(0)
    }
  })
})
