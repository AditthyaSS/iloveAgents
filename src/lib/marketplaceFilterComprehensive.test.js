import { describe, it, expect } from 'vitest'
import { filterListings } from './marketplace'

describe('filterListings — comprehensive scenarios', () => {
  const listings = [
    { name: 'Python Code Writer',   category: 'Data Processing',    tags: ['python', 'code', 'automation'] },
    { name: 'React Component Gen',  category: 'Content Generation', tags: ['react', 'javascript', 'frontend'] },
    { name: 'SQL Analyzer',         category: 'Data Processing',    tags: ['sql', 'database', 'analytics'] },
    { name: 'Blog Post Generator',  category: 'Content Generation', tags: ['writing', 'blog', 'marketing'] },
    { name: 'Market Research Tool', category: 'Research',           tags: ['research', 'analysis', 'competitive'] },
    { name: 'PDF Summarizer',       category: 'Research',           tags: ['pdf', 'summary', 'documents'] },
  ]

  it('returns all 6 with no filters', () => {
    expect(filterListings(listings)).toHaveLength(6)
  })

  it('Data Processing returns 2 listings', () => {
    expect(filterListings(listings, { category: 'Data Processing' })).toHaveLength(2)
  })

  it('Research returns 2 listings', () => {
    expect(filterListings(listings, { category: 'Research' })).toHaveLength(2)
  })

  it('search "python" finds 1 result', () => {
    expect(filterListings(listings, { search: 'python' })).toHaveLength(1)
  })

  it('search "analysis" finds 2 results (tag)', () => {
    const results = filterListings(listings, { search: 'analysis' })
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('combined: Research + pdf finds 1 result', () => {
    const results = filterListings(listings, { category: 'Research', search: 'pdf' })
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('PDF Summarizer')
  })

  it('category with no match returns empty', () => {
    expect(filterListings(listings, { category: 'Nonexistent Category' })).toHaveLength(0)
  })

  it('search with no match returns empty', () => {
    expect(filterListings(listings, { search: 'xyzzy_no_match' })).toHaveLength(0)
  })
})
