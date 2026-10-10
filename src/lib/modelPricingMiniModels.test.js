import { describe, it, expect } from 'vitest'
import { getPricing, estimateInputCost, estimateOutputCost, getContextWindow } from './modelPricing'

describe('Mini/budget model pricing comparison', () => {
  describe('GPT-4o-mini vs GPT-4o', () => {
    it('gpt-4o-mini is 16.7x cheaper on input', () => {
      const mini = estimateInputCost('gpt-4o-mini', 1_000_000)
      const full = estimateInputCost('gpt-4o', 1_000_000)
      expect(full / mini).toBeCloseTo(16.7, 0)
    })

    it('same context window (128k)', () => {
      expect(getContextWindow('gpt-4o-mini')).toBe(getContextWindow('gpt-4o'))
    })
  })

  describe('Claude 3.5 Haiku vs Claude 3.5 Sonnet', () => {
    it('Haiku is cheaper on input', () => {
      const haiku = estimateInputCost('claude-3-5-haiku-20241022', 1_000_000)
      const sonnet = estimateInputCost('claude-3-5-sonnet-20241022', 1_000_000)
      expect(haiku).toBeLessThan(sonnet)
    })

    it('both have 200k context window', () => {
      expect(getContextWindow('claude-3-5-haiku-20241022')).toBe(200_000)
      expect(getContextWindow('claude-3-5-sonnet-20241022')).toBe(200_000)
    })
  })

  describe('Gemini Flash vs Gemini Pro', () => {
    it('Gemini 2.5 Flash is cheaper than Gemini 1.5 Pro on input', () => {
      const flash = estimateInputCost('gemini-2.5-flash', 1_000_000)
      const pro = estimateInputCost('gemini-1.5-pro', 1_000_000)
      expect(flash).toBeLessThan(pro)
    })
  })
})
