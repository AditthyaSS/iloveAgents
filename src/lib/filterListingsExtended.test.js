import { describe, it, expect } from 'vitest'
import { filterListings } from './marketplace'

const listings = [
  { name: 'Blog Writer',    category: 'Content Generation', tags: ['writing', 'content', 'blog'] },
  { name: 'Data Extractor', category: 'Data Processing',   tags: ['scraping', 'data', 'csv'] },
  { name: 'Research Bot',   category: 'Research',           tags: ['search', 'analysis', 'web'] },
  { name: 'SEO Analyzer',   category: 'Content Generation', tags: ['seo', 'keywords', 'content'] },
  { name: 'PDF Processor',  category: 'Data Processing',   tags: ['pdf', 'extraction', 'data'] },
]

describe('filterListings — comprehensive search and category tests', () => {
  it('returns all listings with no filters', () => {
    expect(filterListings(listings)).toHaveLength(5)
  })

  it('filters by partial name match', () => {
    expect(filterListings(listings, { search: 'writer' })).toHaveLength(1)
  })

  it('search trims whitespace before matching', () => {
    expect(filterListings(listings, { search: '  blog  ' })).toHaveLength(1)
  })

  it('search matches partial tag', () => {
    expect(filterListings(listings, { search: 'scrap' })).toHaveLength(1)
  })

  it('category filter is exact match', () => {
    const results = filterListings(listings, { category: 'Data Processing' })
    expect(results).toHaveLength(2)
    expect(results.every((l) => l.category === 'Data Processing')).toBe(true)
  })

  it('category + search combined narrows results', () => {
    const results = filterListings(listings, {
      category: 'Content Generation',
      search: 'seo',
    })
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('SEO Analyzer')
  })

  it('search matches multiple listings', () => {
    // 'data' appears in tags of Data Extractor and PDF Processor
    const results = filterListings(listings, { search: 'data' })
    expect(results.length).toBeGreaterThanOrEqual(2)
  })

  it('no results when nothing matches', () => {
    expect(filterListings(listings, { search: 'xyz_nonexistent_agent' })).toHaveLength(0)
  })

  it('empty search returns all listings', () => {
    expect(filterListings(listings, { search: '' })).toHaveLength(5)
  })

  it('empty category returns all listings', () => {
    expect(filterListings(listings, { category: '' })).toHaveLength(5)
  })

  it('handles empty listings array', () => {
    expect(filterListings([], { search: 'anything' })).toHaveLength(0)
  })
})
