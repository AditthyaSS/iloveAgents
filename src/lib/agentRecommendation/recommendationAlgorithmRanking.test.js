import { describe, it, expect } from 'vitest'
import { normalizeScore } from './scoring.js'
import { DEFAULT_RECOMMENDATION_WEIGHTS } from './constants.js'

describe('Recommendation algorithm ranking logic', () => {
  const W = DEFAULT_RECOMMENDATION_WEIGHTS

  describe('Score ordering', () => {
    it('exact category match > goal category match', () => {
      const exactScore = normalizeScore(W.exactCategory, W.exactCategory + W.goalCategory)
      const goalScore = normalizeScore(W.goalCategory, W.exactCategory + W.goalCategory)
      expect(exactScore).toBeGreaterThan(goalScore)
    })

    it('exact provider > any provider', () => {
      const exact = normalizeScore(W.providerExact, W.providerExact + W.providerAny)
      const any = normalizeScore(W.providerAny, W.providerExact + W.providerAny)
      expect(exact).toBeGreaterThan(any)
    })

    it('free text in name > free text in description', () => {
      expect(W.freeTextName).toBeGreaterThan(W.freeTextDescription)
    })
  })

  describe('Combined score computation', () => {
    it('perfect match (all signals) normalizes near 100', () => {
      const maxScore = Object.values(W).reduce((s, w) => s + w, 0)
      expect(normalizeScore(maxScore, maxScore)).toBe(100)
    })

    it('no signals normalizes to 0', () => {
      const maxScore = Object.values(W).reduce((s, w) => s + w, 0)
      expect(normalizeScore(0, maxScore)).toBe(0)
    })

    it('half signals normalizes near 50', () => {
      const maxScore = Object.values(W).reduce((s, w) => s + w, 0)
      expect(normalizeScore(maxScore / 2, maxScore)).toBe(50)
    })
  })
})
