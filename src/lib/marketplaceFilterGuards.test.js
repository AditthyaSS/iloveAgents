import { describe, it, expect } from 'vitest'
import { filterListings } from './marketplace'

describe('filterListings guards', () => {
  it('handles null inputs and normalizes categories', () => {
    expect(filterListings(null, { search: 'x' })).toEqual([])
    expect(filterListings(undefined)).toEqual([])
    expect(filterListings([null, 'nope', 42], { search: '' })).toEqual([])
    expect(filterListings([{ id: '1', category: 'Research' }], { search: null })).toHaveLength(1)
    const listings = [{ id: '1', name: 'A', category: 'Research' }]
    expect(filterListings(listings, { category: ' research ' })).toHaveLength(1)
    expect(filterListings(listings, { category: 'RESEARCH' })).toHaveLength(1)
  })
})
