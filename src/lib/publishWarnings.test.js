import { describe, it, expect, beforeEach } from 'vitest'
import { publishAgent, loadListings } from './marketplace'

beforeEach(() => {
  localStorage.clear()
})

describe('publishAgent warnings', () => {
  it('reports trimmed tags and remapped categories', () => {
    const { listing, warnings } = publishAgent({
      name: 'N',
      description: 'd',
      tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
      category: 'Nope',
      config: {},
    })
    expect(listing.tags).toHaveLength(8)
    expect(listing.category).toBe('Data Processing')
    expect(warnings.join(' ')).toMatch(/2 tag\(s\) dropped/)
    expect(warnings.join(' ')).toMatch(/remapped/)
    expect(loadListings()).toHaveLength(1)
  })

  it('stays quiet on clean publishes', () => {
    const { warnings } = publishAgent({
      name: 'N',
      description: 'd',
      tags: ['a'],
      category: 'Research',
      config: {},
    })
    expect(warnings).toEqual([])
  })
})
