import { describe, it, expect } from 'vitest'
import { estimateCost } from './useAgentRunMetrics.js'

describe('estimateCost', () => {
  it('returns null for an unknown model', () => {
    expect(estimateCost('unknown-model', 1000, 500)).toBeNull()
  })

  it('returns null for undefined model', () => {
    expect(estimateCost(undefined, 1000, 500)).toBeNull()
  })

  it('calculates cost for gpt-4o correctly', () => {
    // gpt-4o: input $0.005/1K tokens, output $0.015/1K tokens
    // 1000 input + 500 output = (1*0.005) + (0.5*0.015) = 0.005 + 0.0075 = 0.0125
    const cost = estimateCost('gpt-4o', 1000, 500)
    expect(cost).toBeCloseTo(0.0125, 5)
  })

  it('calculates cost for claude-sonnet correctly', () => {
    // claude-sonnet: input $0.003/1K tokens, output $0.015/1K tokens
    // 2000 input + 1000 output = (2*0.003) + (1*0.015) = 0.006 + 0.015 = 0.021
    const cost = estimateCost('claude-sonnet', 2000, 1000)
    expect(cost).toBeCloseTo(0.021, 5)
  })

  it('returns 0 for zero tokens', () => {
    expect(estimateCost('gpt-4o', 0, 0)).toBe(0)
  })

  it('output cost is higher than input cost per token for gpt-4o', () => {
    const inputCost = estimateCost('gpt-4o', 1000, 0)
    const outputCost = estimateCost('gpt-4o', 0, 1000)
    expect(outputCost).toBeGreaterThan(inputCost)
  })

  it('scales linearly with token count', () => {
    const cost1k = estimateCost('gpt-4o', 1000, 0)
    const cost2k = estimateCost('gpt-4o', 2000, 0)
    expect(cost2k).toBeCloseTo(cost1k * 2, 5)
  })

  it('returns a finite number for known models with non-zero tokens', () => {
    const cost = estimateCost('gpt-4o', 500, 200)
    expect(typeof cost).toBe('number')
    expect(Number.isFinite(cost)).toBe(true)
    expect(cost).toBeGreaterThan(0)
  })
})
