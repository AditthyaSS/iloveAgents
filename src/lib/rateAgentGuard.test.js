import { describe, it, expect, beforeEach } from 'vitest'
import { publishAgent, rateAgent, getAverageRating } from './marketplace'

beforeEach(() => {
  localStorage.clear()
})

describe('rateAgent input guards', () => {
  it('rejects non-numeric stars without touching the listing', () => {
    const listing = publishAgent({
      name: 'Rater',
      description: 'd',
      tags: [],
      category: 'Research',
      config: {},
    })
    expect(rateAgent(listing.id, undefined)).toBeNull()
    expect(rateAgent(listing.id, NaN)).toBeNull()
    expect(rateAgent(listing.id, '5')).toBeNull()
    expect(getAverageRating({ ratingTotal: 0, ratingCount: 0 })).toBe(0)
  })

  it('rates valid stars and contains poisoned totals', () => {
    const listing = publishAgent({
      name: 'Rater',
      description: 'd',
      tags: [],
      category: 'Research',
      config: {},
    })
    const res = rateAgent(listing.id, 5)
    expect(res.count).toBe(1)
    expect(res.average).toBe(5)
    expect(getAverageRating({ ratingTotal: NaN, ratingCount: 2 })).toBe(0)
  })
})
