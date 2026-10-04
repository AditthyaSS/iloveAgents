import { describe, it, expect } from 'vitest'
import { filterListings, MARKETPLACE_CATEGORIES } from './marketplace'

describe('MARKETPLACE_CATEGORIES — exhaustive coverage', () => {
  MARKETPLACE_CATEGORIES.forEach((category) => {
    it(`can filter listings by category "${category}"`, () => {
      const listings = [
        { name: 'Test Agent', category, tags: ['test'] }
      ]
      const results = filterListings(listings, { category })
      expect(results).toHaveLength(1)
    })
  })

  it('filterListings with each valid category returns correct results', () => {
    const listings = MARKETPLACE_CATEGORIES.map((cat, i) => ({
      name: `Agent ${i}`,
      category: cat,
      tags: [`tag${i}`],
    }))

    for (const cat of MARKETPLACE_CATEGORIES) {
      const results = filterListings(listings, { category: cat })
      expect(results).toHaveLength(1)
      expect(results[0].category).toBe(cat)
    }
  })

  it('filter by empty category returns all listings', () => {
    const listings = MARKETPLACE_CATEGORIES.map((cat, i) => ({
      name: `Agent ${i}`, category: cat, tags: []
    }))
    expect(filterListings(listings, { category: '' })).toHaveLength(MARKETPLACE_CATEGORIES.length)
  })
})
