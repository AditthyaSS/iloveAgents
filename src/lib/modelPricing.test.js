import { describe, it, expect } from 'vitest'
import {
  MODEL_PRICING,
  getPricing,
  estimateInputCost,
  estimateOutputCost,
  getContextWindow,
} from './modelPricing'
import { MODELS } from './resolveAgentModel'

describe('modelPricing', () => {
  it('prices a known model by the table rates', () => {
    expect(estimateInputCost('gpt-4o-mini', 1_000_000)).toBeCloseTo(0.15)
    expect(estimateOutputCost('gpt-4o-mini', 1_000_000)).toBeCloseTo(0.6)
  })

  it('returns null for unknown models', () => {
    expect(getPricing('nope')).toBeNull()
    expect(estimateInputCost('nope', 100)).toBeNull()
    expect(estimateOutputCost('nope', 100)).toBeNull()
  })

  it('falls back to a sane context window', () => {
    expect(getContextWindow('gpt-4o')).toBe(128000)
    expect(getContextWindow('nope')).toBe(128000)
  })

  it('covers every selectable model id', () => {
    const selectable = Object.values(MODELS).flat().map((m) => m.value)
    const missing = selectable.filter((id) => !getPricing(id))
    expect(missing).toEqual([])
  })

  it('keeps every table entry well formed', () => {
    for (const [id, entry] of Object.entries(MODEL_PRICING)) {
      expect(typeof entry.provider, id).toBe('string')
      expect(entry.inputCostPer1M, id).toBeGreaterThan(0)
      expect(entry.outputCostPer1M, id).toBeGreaterThan(0)
      expect(entry.contextWindow, id).toBeGreaterThan(0)
    }
  })
})
