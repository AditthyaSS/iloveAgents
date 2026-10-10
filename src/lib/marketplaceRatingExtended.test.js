import { describe, it, expect } from 'vitest'
import { getAverageRating } from './marketplace'

describe('getAverageRating — comprehensive tests', () => {
  describe('normal rating calculations', () => {
    it('returns 5.0 for 1 rating of 5', () => {
      expect(getAverageRating({ ratingCount: 1, ratingTotal: 5 })).toBe(5)
    })

    it('returns 1.0 for 1 rating of 1', () => {
      expect(getAverageRating({ ratingCount: 1, ratingTotal: 1 })).toBe(1)
    })

    it('rounds to 1 decimal place', () => {
      // 10/3 = 3.333... → 3.3
      expect(getAverageRating({ ratingCount: 3, ratingTotal: 10 })).toBe(3.3)
    })

    it('rounds up at .05', () => {
      // 41/8 = 5.125... rounds to 5.1
      expect(getAverageRating({ ratingCount: 8, ratingTotal: 41 })).toBe(5.1)
    })

    it('100 ratings totaling 450 → 4.5', () => {
      expect(getAverageRating({ ratingCount: 100, ratingTotal: 450 })).toBe(4.5)
    })
  })

  describe('zero and falsy inputs', () => {
    it('returns 0 for ratingCount: 0', () => {
      expect(getAverageRating({ ratingCount: 0, ratingTotal: 0 })).toBe(0)
    })

    it('returns 0 for null listing', () => {
      expect(getAverageRating(null)).toBe(0)
    })

    it('returns 0 for undefined listing', () => {
      expect(getAverageRating(undefined)).toBe(0)
    })

    it('returns 0 for listing without ratingCount property', () => {
      expect(getAverageRating({})).toBe(0)
    })

    it('returns 0 when ratingCount is falsy (0)', () => {
      expect(getAverageRating({ ratingCount: 0, ratingTotal: 100 })).toBe(0)
    })
  })

  describe('edge case totals', () => {
    it('returns 0 for ratingTotal: 0 with 1 count', () => {
      expect(getAverageRating({ ratingCount: 1, ratingTotal: 0 })).toBe(0)
    })

    it('large count and total: 1000 ratings totaling 4321 → 4.3', () => {
      expect(getAverageRating({ ratingCount: 1000, ratingTotal: 4321 })).toBe(4.3)
    })
  })
})
