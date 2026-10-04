import { describe, it, expect } from 'vitest'
import { getPricing, estimateInputCost, estimateOutputCost, getContextWindow } from './modelPricing'

describe('GPT-4o complete pricing verification', () => {
  it('gpt-4o has all required pricing fields', () => {
    const p = getPricing('gpt-4o')
    expect(p).not.toBeNull()
    expect(p.provider).toBe('openai')
    expect(p.inputCostPer1M).toBe(2.5)
    expect(p.outputCostPer1M).toBe(10.0)
    expect(p.contextWindow).toBe(128000)
  })

  it('gpt-4o-mini costs 94% less than gpt-4o for input', () => {
    const gpt4o = estimateInputCost('gpt-4o', 1_000_000)
    const mini = estimateInputCost('gpt-4o-mini', 1_000_000)
    const savings = ((gpt4o - mini) / gpt4o) * 100
    expect(savings).toBeGreaterThan(90)
  })

  it('1000 tokens costs $0.0025 for gpt-4o input', () => {
    expect(estimateInputCost('gpt-4o', 1000)).toBeCloseTo(0.0025)
  })

  it('1000 tokens costs $0.01 for gpt-4o output', () => {
    expect(estimateOutputCost('gpt-4o', 1000)).toBeCloseTo(0.01)
  })

  it('100k tokens: gpt-4o costs $0.25', () => {
    expect(estimateInputCost('gpt-4o', 100_000)).toBeCloseTo(0.25)
  })
})

describe('GPT-4o-mini complete pricing verification', () => {
  it('gpt-4o-mini input is $0.15 per 1M', () => {
    expect(estimateInputCost('gpt-4o-mini', 1_000_000)).toBeCloseTo(0.15)
  })

  it('gpt-4o-mini output is $0.60 per 1M', () => {
    expect(estimateOutputCost('gpt-4o-mini', 1_000_000)).toBeCloseTo(0.60)
  })

  it('gpt-4o-mini context window is 128000', () => {
    expect(getContextWindow('gpt-4o-mini')).toBe(128000)
  })
})
