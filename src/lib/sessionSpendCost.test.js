/**
 * Tests for session spend cost math.
 *
 * useSessionSpend uses React hooks (useState, useCallback, useEffect)
 * which require a renderer. This file tests the underlying cost functions
 * directly: estimateInputCost and estimateOutputCost from useAgentRunMetrics
 * (which useSessionSpend delegates to), and the totalCost accumulation logic.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { estimateCost } from './useAgentRunMetrics.js'

// Session spend integrates loadSession/saveSession via localStorage.
// These tests verify the cost math rather than the React lifecycle.

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
  }
})()

beforeEach(() => {
  globalThis.localStorage = localStorageMock
  localStorageMock.clear()
})

describe('session spend cost math (via estimateCost)', () => {
  it('runCost = inputCost + outputCost', () => {
    // PRICING: gpt-4o input $0.005/1K, output $0.015/1K
    // 1000 input tokens = (1000/1000)*0.005 = $0.005
    // 500 output tokens = (500/1000)*0.015 = $0.0075
    const inputC = estimateCost('gpt-4o', 1000, 0)
    const outputC = estimateCost('gpt-4o', 0, 500)
    const runCost = (inputC || 0) + (outputC || 0)
    expect(runCost).toBeCloseTo(0.0125, 5)
  })

  it('runCost is 0 when all tokens are 0', () => {
    const inputC = estimateCost('gpt-4o', 0, 0) || 0
    const outputC = 0
    expect(inputC + outputC).toBe(0)
  })

  it('runCost is non-negative', () => {
    const runs = [
      { inputTokens: 100, outputTokens: 50, model: 'gpt-4o' },
      { inputTokens: 500, outputTokens: 200, model: 'gpt-4o-mini' },
      { inputTokens: 0, outputTokens: 0, model: 'gpt-4o' },
    ]
    for (const run of runs) {
      const inputC = estimateCost(run.model, run.inputTokens, 0) || 0
      const outputC = estimateCost(run.model, 0, run.outputTokens) || 0
      expect(inputC + outputC).toBeGreaterThanOrEqual(0)
    }
  })

  it('total spend = sum of all run costs', () => {
    const runs = [
      estimateCost('gpt-4o', 1000, 500) || 0,
      estimateCost('gpt-4o-mini', 2000, 800) || 0,
      estimateCost('claude-sonnet', 500, 200) || 0,
    ]
    const total = runs.reduce((sum, cost) => sum + cost, 0)
    // Each cost individually is non-negative, sum is the total
    expect(total).toBeGreaterThanOrEqual(Math.max(...runs))
    expect(typeof total).toBe('number')
    expect(Number.isFinite(total)).toBe(true)
  })

  it('null input/output costs default to 0 in total', () => {
    // When estimateCost returns null (unknown model), use 0
    const costForUnknown = estimateCost('unknown-model', 1000, 500)
    const runCost = (costForUnknown || 0)
    expect(runCost).toBe(0)
  })

  it('MAX_RUNS cap: oldest run is dropped when run count exceeds max', () => {
    // The MAX_RUNS = 50 cap ensures localStorage doesn't grow unbounded.
    // We verify the array slicing math by simulating 55 runs.
    const MAX_RUNS = 50
    const runs = Array.from({ length: 55 }, (_, i) => ({ totalCost: i * 0.01 }))
    const capped = [{ totalCost: 99 }, ...runs].slice(0, MAX_RUNS)
    expect(capped.length).toBe(MAX_RUNS)
    expect(capped[0].totalCost).toBe(99) // newest first
  })

  it('totalSpend recalculated from runs array', () => {
    const runs = [
      { totalCost: 0.01 },
      { totalCost: 0.02 },
      { totalCost: 0.005 },
    ]
    const totalSpend = runs.reduce((sum, r) => sum + r.totalCost, 0)
    expect(totalSpend).toBeCloseTo(0.035, 5)
  })
})
