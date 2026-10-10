import { describe, it, expect } from 'vitest'
import { filterListings } from './marketplace'

const listings = [
  { id: '1', name: 'Alpha', description: 'great for research', author: 'sam', category: 'Research', tags: ['x'] },
  { id: '2', name: 'Beta', description: 'other', author: 'ana', category: 'Content Generation', tags: ['y'] },
]

describe('filterListings recall', () => {
  it('matches description, author, and category text', () => {
    expect(filterListings(listings, { search: 'research' }).map((l) => l.id)).toEqual(['1'])
    expect(filterListings(listings, { search: 'ana' }).map((l) => l.id)).toEqual(['2'])
    expect(filterListings(listings, { search: 'content generation' }).map((l) => l.id)).toEqual(['2'])
  })
})
