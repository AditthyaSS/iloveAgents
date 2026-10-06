import { describe, it, expect, beforeEach } from 'vitest'
import {
  MARKETPLACE_CATEGORIES,
  sanitizeAgentConfig,
  publishAgent,
  loadListings,
  importAgent,
  loadDrafts,
  rateAgent,
  getUserVote,
  getAverageRating,
  filterListings,
} from './marketplace.js'

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
  }
})()

beforeEach(() => {
  globalThis.localStorage = localStorageMock
  localStorageMock.clear()
})

const sampleEntry = () => ({
  name: 'Test Agent',
  description: 'A test agent',
  tags: ['testing', 'automation'],
  category: 'Data Processing',
  author: 'Alice',
  config: { prompt: 'Hello', api_key: 'secret-key-123' },
})

describe('MARKETPLACE_CATEGORIES', () => {
  it('is a non-empty array of strings', () => {
    expect(Array.isArray(MARKETPLACE_CATEGORIES)).toBe(true)
    expect(MARKETPLACE_CATEGORIES.length).toBeGreaterThan(0)
    MARKETPLACE_CATEGORIES.forEach(c => expect(typeof c).toBe('string'))
  })
})

describe('sanitizeAgentConfig', () => {
  it('replaces credential-like field values with a placeholder', () => {
    const { config } = sanitizeAgentConfig({ api_key: 'secret', normal: 'value' })
    expect(config.api_key).not.toBe('secret')
    expect(config.api_key).toContain('HERE')
    expect(config.normal).toBe('value')
  })

  it('reports sanitized field paths', () => {
    const { sanitizedFields } = sanitizeAgentConfig({ token: 'abc' })
    expect(sanitizedFields).toContain('token')
  })

  it('handles nested credential fields', () => {
    const { config, sanitizedFields } = sanitizeAgentConfig({ settings: { api_key: 'secret' } })
    expect(config.settings.api_key).toContain('HERE')
    expect(sanitizedFields.some(f => f.includes('api_key'))).toBe(true)
  })

  it('does not touch non-credential fields', () => {
    const { config } = sanitizeAgentConfig({ prompt: 'be helpful', temperature: 0.7 })
    expect(config.prompt).toBe('be helpful')
    expect(config.temperature).toBe(0.7)
  })

  it('handles empty config gracefully', () => {
    expect(() => sanitizeAgentConfig({})).not.toThrow()
    expect(() => sanitizeAgentConfig(null)).not.toThrow()
  })
})

describe('publishAgent', () => {
  it('creates a listing with a unique id', () => {
    const l1 = publishAgent(sampleEntry())
    const l2 = publishAgent(sampleEntry())
    expect(l1.id).not.toBe(l2.id)
  })

  it('sanitizes the config before storing', () => {
    const listing = publishAgent(sampleEntry())
    expect(listing.config.api_key).not.toBe('secret-key-123')
  })

  it('stores the listing so loadListings includes it', () => {
    publishAgent(sampleEntry())
    expect(loadListings().length).toBe(1)
  })

  it('defaults category to first MARKETPLACE_CATEGORIES if invalid', () => {
    const listing = publishAgent({ ...sampleEntry(), category: 'NotReal' })
    expect(listing.category).toBe(MARKETPLACE_CATEGORIES[0])
  })

  it('defaults author to "Anonymous" when blank', () => {
    const listing = publishAgent({ ...sampleEntry(), author: '' })
    expect(listing.author).toBe('Anonymous')
  })

  it('initializes importCount, ratingTotal, and ratingCount to 0', () => {
    const listing = publishAgent(sampleEntry())
    expect(listing.importCount).toBe(0)
    expect(listing.ratingTotal).toBe(0)
    expect(listing.ratingCount).toBe(0)
  })

  it('caps tags at 8', () => {
    const tags = Array.from({ length: 12 }, (_, i) => `tag${i}`)
    const listing = publishAgent({ ...sampleEntry(), tags })
    expect(listing.tags.length).toBeLessThanOrEqual(8)
  })
})

describe('loadListings', () => {
  it('returns empty array when nothing is published', () => {
    expect(loadListings()).toEqual([])
  })

  it('returns listings in newest-first order', () => {
    publishAgent({ ...sampleEntry(), name: 'First' })
    publishAgent({ ...sampleEntry(), name: 'Second' })
    const listings = loadListings()
    expect(listings[0].name).toBe('Second')
  })
})

describe('importAgent', () => {
  it('creates a draft from a published listing', () => {
    const listing = publishAgent(sampleEntry())
    const draft = importAgent(listing.id)
    expect(draft).not.toBeNull()
    expect(draft.sourceListingId).toBe(listing.id)
  })

  it('returns null for a non-existent listing id', () => {
    expect(importAgent('not-real')).toBeNull()
  })

  it('increments the listing import count', () => {
    const listing = publishAgent(sampleEntry())
    importAgent(listing.id)
    const updated = loadListings().find(l => l.id === listing.id)
    expect(updated.importCount).toBe(1)
  })

  it('stores the draft so loadDrafts includes it', () => {
    const listing = publishAgent(sampleEntry())
    importAgent(listing.id)
    expect(loadDrafts().length).toBe(1)
  })
})

describe('rateAgent', () => {
  it('returns average and count after first rating', () => {
    const listing = publishAgent(sampleEntry())
    const result = rateAgent(listing.id, 4)
    expect(result.average).toBe(4)
    expect(result.count).toBe(1)
  })

  it('clamps stars to 1–5', () => {
    const listing = publishAgent(sampleEntry())
    rateAgent(listing.id, 0)
    const result1 = rateAgent(listing.id, 10)
    expect(result1.average).toBeLessThanOrEqual(5)
    expect(result1.average).toBeGreaterThanOrEqual(1)
  })

  it('replaces a previous vote instead of adding another', () => {
    const listing = publishAgent(sampleEntry())
    rateAgent(listing.id, 2)
    rateAgent(listing.id, 4) // re-rate
    const updated = loadListings().find(l => l.id === listing.id)
    expect(updated.ratingCount).toBe(1) // still only one rater
    expect(updated.ratingTotal).toBe(4)
  })

  it('returns null for non-existent listing', () => {
    expect(rateAgent('ghost-id', 3)).toBeNull()
  })
})

describe('getUserVote', () => {
  it('returns null when the listing has not been rated', () => {
    expect(getUserVote('unrated')).toBeNull()
  })

  it('returns the vote after rating', () => {
    const listing = publishAgent(sampleEntry())
    rateAgent(listing.id, 3)
    expect(getUserVote(listing.id)).toBe(3)
  })
})

describe('getAverageRating', () => {
  it('returns 0 for an unrated listing', () => {
    const listing = publishAgent(sampleEntry())
    expect(getAverageRating(listing)).toBe(0)
  })

  it('calculates average correctly', () => {
    expect(getAverageRating({ ratingTotal: 9, ratingCount: 3 })).toBe(3)
  })

  it('rounds to one decimal place', () => {
    expect(getAverageRating({ ratingTotal: 10, ratingCount: 3 })).toBe(3.3)
  })
})

describe('filterListings', () => {
  const listings = [
    { id: '1', name: 'Code Helper', category: 'Data Processing', tags: ['code', 'debug'] },
    { id: '2', name: 'Data Analyzer', category: 'Research', tags: ['data', 'analysis'] },
    { id: '3', name: 'Blog Writer', category: 'Content Generation', tags: ['writing', 'blog'] },
  ]

  it('returns all listings when no filters are applied', () => {
    expect(filterListings(listings).length).toBe(3)
  })

  it('filters by category', () => {
    const filtered = filterListings(listings, { category: 'Research' })
    expect(filtered.every(l => l.category === 'Research')).toBe(true)
  })

  it('filters by search term in name', () => {
    const filtered = filterListings(listings, { search: 'code' })
    expect(filtered.some(l => l.name.toLowerCase().includes('code'))).toBe(true)
  })

  it('filters by search term in tags', () => {
    const filtered = filterListings(listings, { search: 'debug' })
    expect(filtered.some(l => l.tags.includes('debug'))).toBe(true)
  })

  it('returns empty array when nothing matches', () => {
    expect(filterListings(listings, { search: 'xyz-nomatch' })).toEqual([])
  })

  it('is case-insensitive', () => {
    const filtered = filterListings(listings, { search: 'CODE' })
    expect(filtered.length).toBeGreaterThan(0)
  })
})
