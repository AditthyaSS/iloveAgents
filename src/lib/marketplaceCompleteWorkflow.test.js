import { describe, it, expect } from 'vitest'
import { sanitizeAgentConfig, filterListings, getAverageRating, MARKETPLACE_CATEGORIES } from './marketplace'

describe('marketplace — complete publish and discover workflow', () => {
  it('simulates publish → discover pipeline', () => {
    // 1. Agent config with credential
    const rawConfig = {
      name: 'Code Reviewer Agent',
      model: 'gpt-4o',
      openai_api_key: 'sk-prod-secret-key',
      temperature: 0.3,
    }

    // 2. Sanitize before publishing
    const { config, sanitizedFields } = sanitizeAgentConfig(rawConfig)
    expect(config.openai_api_key).toContain('HERE')
    expect(sanitizedFields).toContain('openai_api_key')
    expect(config.name).toBe('Code Reviewer Agent')

    // 3. Create listing
    const listing = {
      name: config.name,
      category: MARKETPLACE_CATEGORIES[0],
      tags: ['code', 'review', 'quality'],
      ratingCount: 15,
      ratingTotal: 72,
    }

    // 4. Discover via search
    const allListings = [
      listing,
      { name: 'Blog Writer', category: MARKETPLACE_CATEGORIES[1], tags: ['writing'], ratingCount: 0, ratingTotal: 0 }
    ]

    const codeResults = filterListings(allListings, { search: 'code' })
    expect(codeResults).toHaveLength(1)
    expect(codeResults[0].name).toBe('Code Reviewer Agent')

    // 5. Get rating
    const rating = getAverageRating(listing)
    expect(rating).toBe(4.8) // 72/15 = 4.8
    expect(rating).toBeGreaterThan(4)
  })
})
