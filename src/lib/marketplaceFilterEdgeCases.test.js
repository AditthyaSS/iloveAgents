import { describe, it, expect } from 'vitest'
import { filterListings, getAverageRating } from './marketplace'

const LISTINGS = [
  { name: 'Research Assistant', category: 'Research', tags: ['search', 'analysis', 'web'], ratingCount: 20, ratingTotal: 90 },
  { name: 'Code Generator', category: 'Data Processing', tags: ['code', 'api', 'python'], ratingCount: 50, ratingTotal: 245 },
  { name: 'Writing Wizard', category: 'Content Generation', tags: ['writing', 'blog', 'email'], ratingCount: 35, ratingTotal: 168 },
]

describe('filterListings — edge cases', () => {
  it('category match is case-sensitive', () => {
    const results = filterListings(LISTINGS, { category: 'research' })
    // 'research' !== 'Research' — case-sensitive
    expect(results).toHaveLength(0)
  })

  it('exact category match works', () => {
    expect(filterListings(LISTINGS, { category: 'Research' })).toHaveLength(1)
  })

  it('search for partial category name does not filter by category', () => {
    // Search only matches name and tags, not category
    const results = filterListings(LISTINGS, { search: 'Research' })
    expect(results.some((l) => l.name === 'Research Assistant')).toBe(true)
  })

  it('empty tags array never matches tag search', () => {
    const noTagsListing = [{ name: 'No Tags Agent', category: 'Research', tags: [] }]
    expect(filterListings(noTagsListing, { search: 'analysis' })).toHaveLength(0)
  })

  it('search matches in name even when tags are empty', () => {
    const noTagsListing = [{ name: 'Writing Agent', category: 'Research', tags: [] }]
    expect(filterListings(noTagsListing, { search: 'writing' })).toHaveLength(1)
  })
})

describe('getAverageRating with real listing data', () => {
  it('calculates Research Assistant rating correctly', () => {
    expect(getAverageRating(LISTINGS[0])).toBe(4.5) // 90/20 = 4.5
  })

  it('calculates Code Generator rating correctly', () => {
    expect(getAverageRating(LISTINGS[1])).toBe(4.9) // 245/50 = 4.9
  })

  it('calculates Writing Wizard rating correctly', () => {
    expect(getAverageRating(LISTINGS[2])).toBe(4.8) // 168/35 = 4.8
  })
})
