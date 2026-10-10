import { describe, it, expect } from 'vitest'
import { getAverageRating } from './marketplace'

describe('getAverageRating — 5-star scale validation', () => {
  it('5-star average: 5 ratings all 5 = 5.0', () => {
    expect(getAverageRating({ ratingCount: 5, ratingTotal: 25 })).toBe(5.0)
  })

  it('1-star average: 3 ratings all 1 = 1.0', () => {
    expect(getAverageRating({ ratingCount: 3, ratingTotal: 3 })).toBe(1.0)
  })

  it('3.5 star average', () => {
    expect(getAverageRating({ ratingCount: 2, ratingTotal: 7 })).toBe(3.5)
  })

  it('result stays within 0-5 range for all valid inputs', () => {
    const tests = [
      { ratingCount: 1, ratingTotal: 1 },
      { ratingCount: 1, ratingTotal: 5 },
      { ratingCount: 100, ratingTotal: 300 },
      { ratingCount: 1000, ratingTotal: 4500 },
    ]
    for (const { ratingCount, ratingTotal } of tests) {
      const avg = getAverageRating({ ratingCount, ratingTotal })
      expect(avg).toBeGreaterThanOrEqual(0)
      expect(avg).toBeLessThanOrEqual(5)
    }
  })

  it('rounding: 4.666... rounds to 4.7', () => {
    expect(getAverageRating({ ratingCount: 3, ratingTotal: 14 })).toBe(4.7)
  })

  it('rounding: 3.333... rounds to 3.3', () => {
    expect(getAverageRating({ ratingCount: 3, ratingTotal: 10 })).toBe(3.3)
  })
})
