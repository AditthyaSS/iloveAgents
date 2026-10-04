import { describe, it, expect } from 'vitest'
import { sanitizeAgentConfig, filterListings, getAverageRating, MARKETPLACE_CATEGORIES } from './marketplace'

describe('marketplace — full workflow integration', () => {
  it('publish agent workflow: sanitize + filter + rate', () => {
    // 1. Sanitize an agent config with credentials
    const { config, sanitizedFields } = sanitizeAgentConfig({
      name: 'My AI Agent',
      apiKey: 'sk-secret-123',
      model: 'gpt-4o',
      temperature: 0.7,
    })

    expect(config.apiKey).toContain('HERE')
    expect(sanitizedFields).toContain('apiKey')
    expect(config.name).toBe('My AI Agent')

    // 2. Create a listing and filter it
    const listing = {
      name: config.name,
      category: MARKETPLACE_CATEGORIES[0], // 'Data Processing'
      tags: ['ai', 'agent', 'automation'],
      ratingCount: 5,
      ratingTotal: 23,
    }

    const allListings = [listing, { name: 'Other', category: 'Research', tags: ['web'], ratingCount: 0, ratingTotal: 0 }]

    // Filter by category
    const results = filterListings(allListings, { category: MARKETPLACE_CATEGORIES[0] })
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('My AI Agent')

    // 3. Calculate average rating
    const avg = getAverageRating(listing)
    expect(avg).toBeCloseTo(4.6)
  })

  it('empty marketplace returns empty on any filter', () => {
    expect(filterListings([], { search: 'anything', category: 'Research' })).toHaveLength(0)
  })

  it('MARKETPLACE_CATEGORIES are usable as category filter values', () => {
    for (const cat of MARKETPLACE_CATEGORIES) {
      const results = filterListings(
        [{ name: 'Agent', category: cat, tags: [] }],
        { category: cat }
      )
      expect(results).toHaveLength(1)
    }
  })
})
