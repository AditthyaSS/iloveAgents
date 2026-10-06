import { describe, it, expect } from 'vitest'
import {
  MODEL_PRICING,
  getPricing,
  estimateInputCost,
  estimateOutputCost,
  getContextWindow,
} from './modelPricing.js'

describe('MODEL_PRICING', () => {
  it('exports an object with at least one model', () => {
    expect(typeof MODEL_PRICING).toBe('object')
    expect(Object.keys(MODEL_PRICING).length).toBeGreaterThan(0)
  })

  it('every entry has required numeric cost fields', () => {
    for (const [model, config] of Object.entries(MODEL_PRICING)) {
      expect(typeof config.inputCostPer1M, `${model} inputCostPer1M`).toBe('number')
      expect(typeof config.outputCostPer1M, `${model} outputCostPer1M`).toBe('number')
      expect(config.inputCostPer1M, `${model} inputCostPer1M >= 0`).toBeGreaterThanOrEqual(0)
      expect(config.outputCostPer1M, `${model} outputCostPer1M >= 0`).toBeGreaterThanOrEqual(0)
    }
  })

  it('every entry has a positive contextWindow', () => {
    for (const [model, config] of Object.entries(MODEL_PRICING)) {
      expect(config.contextWindow, `${model} contextWindow`).toBeGreaterThan(0)
    }
  })

  it('every entry has a non-empty provider string', () => {
    for (const [model, config] of Object.entries(MODEL_PRICING)) {
      expect(typeof config.provider, `${model} provider`).toBe('string')
      expect(config.provider.length, `${model} provider non-empty`).toBeGreaterThan(0)
    }
  })

  it('output cost is never less than input cost per model', () => {
    for (const [model, config] of Object.entries(MODEL_PRICING)) {
      expect(
        config.outputCostPer1M,
        `${model}: output cost should be >= input cost`
      ).toBeGreaterThanOrEqual(config.inputCostPer1M)
    }
  })
})

describe('getPricing', () => {
  it('returns the config for a known model', () => {
    const result = getPricing('gpt-4o')
    expect(result).not.toBeNull()
    expect(result.provider).toBe('openai')
    expect(result.inputCostPer1M).toBe(2.5)
    expect(result.outputCostPer1M).toBe(10)
  })

  it('returns null for an unknown model', () => {
    expect(getPricing('does-not-exist')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(getPricing('')).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(getPricing(undefined)).toBeNull()
  })
})

describe('estimateInputCost', () => {
  it('calculates cost for 1M input tokens correctly', () => {
    const cost = estimateInputCost('gpt-4o', 1_000_000)
    expect(cost).toBeCloseTo(2.5, 5)
  })

  it('calculates cost for 0 tokens as 0', () => {
    const cost = estimateInputCost('gpt-4o', 0)
    expect(cost).toBe(0)
  })

  it('returns null for unknown model', () => {
    expect(estimateInputCost('unknown-model', 1000)).toBeNull()
  })

  it('scales linearly — 2M tokens costs twice as much as 1M', () => {
    const cost1M = estimateInputCost('gpt-4o-mini', 1_000_000)
    const cost2M = estimateInputCost('gpt-4o-mini', 2_000_000)
    expect(cost2M).toBeCloseTo(cost1M * 2, 5)
  })

  it('handles fractional token counts', () => {
    const cost = estimateInputCost('gpt-4o', 500_000)
    expect(cost).toBeCloseTo(1.25, 5)
  })
})

describe('estimateOutputCost', () => {
  it('calculates cost for 1M output tokens correctly', () => {
    const cost = estimateOutputCost('gpt-4o', 1_000_000)
    expect(cost).toBeCloseTo(10, 5)
  })

  it('calculates cost for 0 tokens as 0', () => {
    const cost = estimateOutputCost('gpt-4o', 0)
    expect(cost).toBe(0)
  })

  it('returns null for unknown model', () => {
    expect(estimateOutputCost('unknown', 1000)).toBeNull()
  })

  it('output cost per token is higher than input cost per token', () => {
    const inputCost = estimateInputCost('gpt-4o', 100)
    const outputCost = estimateOutputCost('gpt-4o', 100)
    expect(outputCost).toBeGreaterThan(inputCost)
  })
})

describe('getContextWindow', () => {
  it('returns the context window for a known model', () => {
    const window = getContextWindow('gpt-4o')
    expect(window).toBe(128000)
  })

  it('returns 128000 (default) for an unknown model', () => {
    const window = getContextWindow('not-a-real-model')
    expect(window).toBe(128000)
  })

  it('returns a positive integer', () => {
    for (const modelId of Object.keys(MODEL_PRICING)) {
      expect(getContextWindow(modelId)).toBeGreaterThan(0)
    }
  })
})
