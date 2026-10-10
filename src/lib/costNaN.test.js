import { describe, it, expect } from 'vitest'
import { estimateCost } from './useAgentRunMetrics'

describe('estimateCost guards', () => {
  it('returns null for bad inputs instead of NaN', () => {
    expect(estimateCost('gpt-4o', undefined, 10)).toBeNull()
    expect(estimateCost('gpt-4o', 10, NaN)).toBeNull()
    expect(estimateCost('gpt-4o', -5, 10)).toBeNull()
    expect(estimateCost('nope', 10, 10)).toBeNull()
  })

  it('computes valid costs', () => {
    expect(estimateCost('gpt-4o', 1000, 1000)).toBeCloseTo(0.02)
  })
})
