import { describe, it, expect } from 'vitest'
import { normalizeScore } from './scoring.js'

describe('normalizeScore — precision and boundary tests', () => {
  describe('exact boundary values', () => {
    it('returns 0 for score exactly 0', () => {
      expect(normalizeScore(0, 100)).toBe(0)
    })

    it('returns 100 for score exactly equal to maxScore', () => {
      expect(normalizeScore(100, 100)).toBe(100)
    })

    it('returns 100 for score slightly above maxScore', () => {
      expect(normalizeScore(101, 100)).toBe(100)
    })

    it('returns 0 for score slightly below 0', () => {
      expect(normalizeScore(-0.01, 100)).toBe(0)
    })
  })

  describe('rounding behavior', () => {
    it('rounds 33.3... to 33', () => {
      expect(normalizeScore(10, 30)).toBe(33)
    })

    it('rounds 66.6... to 67', () => {
      expect(normalizeScore(20, 30)).toBe(67)
    })

    it('returns exact integer without decimal when evenly divisible', () => {
      expect(normalizeScore(25, 100)).toBe(25)
    })
  })

  describe('various maxScore values', () => {
    it('works with fractional maxScore', () => {
      const result = normalizeScore(0.5, 1)
      expect(result).toBe(50)
    })

    it('works with large maxScore', () => {
      expect(normalizeScore(500, 1000)).toBe(50)
    })

    it('works with small fractions', () => {
      expect(normalizeScore(0.1, 0.2)).toBe(50)
    })
  })

  describe('invalid inputs return 0', () => {
    it('score = -Infinity → 0', () => {
      expect(normalizeScore(-Infinity, 100)).toBe(0)
    })

    it('maxScore = -1 → 0 (non-positive maxScore)', () => {
      expect(normalizeScore(50, -1)).toBe(0)
    })

    it('both score and maxScore are 0 → 0', () => {
      expect(normalizeScore(0, 0)).toBe(0)
    })
  })
})
