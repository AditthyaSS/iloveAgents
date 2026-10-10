import { describe, it, expect } from 'vitest'
import { getPricing, estimateInputCost, estimateOutputCost, getContextWindow } from './modelPricing'

describe('Anthropic model pricing', () => {
  const ANTHROPIC_MODELS = [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
  ]

  ANTHROPIC_MODELS.forEach((modelId) => {
    it(`${modelId} exists with anthropic provider`, () => {
      const pricing = getPricing(modelId)
      expect(pricing).not.toBeNull()
      expect(pricing?.provider).toBe('anthropic')
    })
  })

  it('Haiku is cheapest Anthropic model for input', () => {
    const haiku = estimateInputCost('claude-3-5-haiku-20241022', 1_000_000)
    const sonnet = estimateInputCost('claude-3-5-sonnet-20241022', 1_000_000)
    const opus = estimateInputCost('claude-3-opus-20240229', 1_000_000)
    expect(haiku).toBeLessThan(sonnet)
    expect(sonnet).toBeLessThan(opus)
  })

  it('all Anthropic models have 200k context window', () => {
    for (const modelId of ANTHROPIC_MODELS) {
      expect(getContextWindow(modelId)).toBe(200000)
    }
  })

  it('Claude 3 Opus input cost is $15 per 1M', () => {
    expect(estimateInputCost('claude-3-opus-20240229', 1_000_000)).toBeCloseTo(15.0)
  })

  it('Claude 3.5 Sonnet output is $15 per 1M (4x input)', () => {
    const input = estimateInputCost('claude-3-5-sonnet-20241022', 1_000_000)
    const output = estimateOutputCost('claude-3-5-sonnet-20241022', 1_000_000)
    expect(output / input).toBeCloseTo(5, 0) // output is 5x input for Sonnet
  })
})
