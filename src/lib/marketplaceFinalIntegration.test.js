import { describe, it, expect } from 'vitest'
import { sanitizeAgentConfig, filterListings, getAverageRating, MARKETPLACE_CATEGORIES } from './marketplace'

describe('marketplace — security: credential sanitization completeness', () => {
  const CREDENTIAL_PATTERNS = ['api_key', 'apiKey', 'token', 'secret', 'password', 'credential', 'auth']

  CREDENTIAL_PATTERNS.forEach((field) => {
    it(`sanitizes ${field} field`, () => {
      const input = { [field]: 'sk-super-secret-value' }
      const { config } = sanitizeAgentConfig(input)
      expect(config[field]).not.toBe('sk-super-secret-value')
      expect(config[field]).toContain('HERE')
    })
  })

  it('does not sanitize model field', () => {
    const { config } = sanitizeAgentConfig({ model: 'gpt-4o', apiKey: 'sk-test' })
    expect(config.model).toBe('gpt-4o')
  })
})

describe('marketplace — filtering accuracy', () => {
  const listings = [
    { name: 'SEO Optimizer', category: 'Content Generation', tags: ['seo', 'keywords'] },
    { name: 'SQL Builder',   category: 'Data Processing',   tags: ['sql', 'database'] },
    { name: 'PDF Extractor', category: 'Data Processing',   tags: ['pdf', 'ocr'] },
    { name: 'News Digest',   category: 'Research',           tags: ['news', 'summary'] },
  ]

  it('returns exactly 2 Data Processing listings', () => {
    expect(filterListings(listings, { category: 'Data Processing' })).toHaveLength(2)
  })

  it('search "sql" finds only SQL Builder', () => {
    const results = filterListings(listings, { search: 'sql' })
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('SQL Builder')
  })

  it('combined filter narrows to exactly 1', () => {
    const results = filterListings(listings, { category: 'Data Processing', search: 'pdf' })
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('PDF Extractor')
  })
})
