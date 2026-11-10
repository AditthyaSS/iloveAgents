import { describe, it, expect, beforeEach } from 'vitest'
import { normalizeListing, filterListings, loadListings } from './marketplace'

describe('marketplace tagless listings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('normalizes missing tags on load', () => {
    localStorage.setItem('ila_marketplace_listings', JSON.stringify([{ id: 'x', name: 'Old' }]))
    const listings = loadListings()
    expect(listings[0].tags).toEqual([])
    expect(listings[0].sanitizedFields).toEqual([])
  })

  it('filters without crashing on missing tags or names', () => {
    const listings = [{ id: 'x', name: 'Old' }, { id: 'y', name: 'New', tags: ['research'] }]
    expect(() => filterListings(listings, { search: 'res' })).not.toThrow()
    expect(filterListings(listings, { search: 'res' })).toHaveLength(1)
    expect(filterListings(listings, { search: '' })).toHaveLength(2)
  })

  it('drops non string tag entries', () => {
    expect(normalizeListing({ id: 'x', tags: ['ok', 42, null] }).tags).toEqual(['ok'])
  })
})
