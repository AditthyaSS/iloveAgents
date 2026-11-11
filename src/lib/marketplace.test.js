import { describe, it, expect } from 'vitest'
import { getAverageRating, filterListings, sanitizeAgentConfig, MARKETPLACE_CATEGORIES } from './marketplace'

describe('getAverageRating', () => {
  it('returns 0 when ratingCount is 0', () => {
    expect(getAverageRating({ ratingCount: 0, ratingTotal: 0 })).toBe(0)
  })

  it('returns 0 for undefined listing', () => {
    expect(getAverageRating(undefined)).toBe(0)
  })

  it('returns 0 for null listing', () => {
    expect(getAverageRating(null)).toBe(0)
  })

  it('calculates average rating correctly', () => {
    expect(getAverageRating({ ratingCount: 2, ratingTotal: 9 })).toBe(4.5)
  })

  it('rounds to 1 decimal place', () => {
    expect(getAverageRating({ ratingCount: 3, ratingTotal: 10 })).toBe(3.3)
  })

  it('returns 5.0 for all 5-star ratings', () => {
    expect(getAverageRating({ ratingCount: 4, ratingTotal: 20 })).toBe(5)
  })
})

describe('filterListings', () => {
  const listings = [
    { name: 'Blog Writer', category: 'Content Generation', tags: ['writing', 'content'] },
    { name: 'Data Extractor', category: 'Data Processing', tags: ['scraping', 'data'] },
    { name: 'Research Bot', category: 'Research', tags: ['search', 'analysis'] },
    { name: 'SEO Analyzer', category: 'Content Generation', tags: ['seo', 'content'] },
  ]

  it('returns all listings when no filters applied', () => {
    expect(filterListings(listings)).toHaveLength(4)
  })

  it('filters by category', () => {
    const result = filterListings(listings, { category: 'Content Generation' })
    expect(result).toHaveLength(2)
    expect(result.every((l) => l.category === 'Content Generation')).toBe(true)
  })

  it('filters by search term in name', () => {
    const result = filterListings(listings, { search: 'writer' })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Blog Writer')
  })

  it('filters by search term in tags', () => {
    const result = filterListings(listings, { search: 'seo' })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('SEO Analyzer')
  })

  it('search is case-insensitive', () => {
    const result = filterListings(listings, { search: 'DATA' })
    expect(result.length).toBeGreaterThan(0)
  })

  it('combined category + search filter', () => {
    const result = filterListings(listings, { category: 'Content Generation', search: 'seo' })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('SEO Analyzer')
  })

  it('returns empty array when nothing matches', () => {
    expect(filterListings(listings, { search: 'nonexistent_xyz' })).toHaveLength(0)
  })
})

describe('sanitizeAgentConfig', () => {
  it('replaces api_key with placeholder', () => {
    const { config } = sanitizeAgentConfig({ api_key: 'sk-secret123' })
    expect(config.api_key).toContain('HERE')
    expect(config.api_key).not.toBe('sk-secret123')
  })

  it('leaves non-credential fields unchanged', () => {
    const { config } = sanitizeAgentConfig({ name: 'My Agent', temperature: 0.7 })
    expect(config.name).toBe('My Agent')
    expect(config.temperature).toBe(0.7)
  })

  it('reports sanitized field paths', () => {
    const { sanitizedFields } = sanitizeAgentConfig({ apiKey: 'sk-test' })
    expect(sanitizedFields).toContain('apiKey')
  })

  it('handles nested credential fields', () => {
    const { config } = sanitizeAgentConfig({ auth: { token: 'my-token' } })
    expect(config.auth.token).toContain('HERE')
  })

  it('returns empty sanitizedFields when no credentials', () => {
    const { sanitizedFields } = sanitizeAgentConfig({ name: 'Agent', model: 'gpt-4o' })
    expect(sanitizedFields).toHaveLength(0)
  })
})

describe('MARKETPLACE_CATEGORIES', () => {
  it('is an array of strings', () => {
    expect(Array.isArray(MARKETPLACE_CATEGORIES)).toBe(true)
    expect(MARKETPLACE_CATEGORIES.every((c) => typeof c === 'string')).toBe(true)
  })

  it('contains at least one category', () => {
    expect(MARKETPLACE_CATEGORIES.length).toBeGreaterThan(0)
  })
})
