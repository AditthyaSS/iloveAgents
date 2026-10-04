import { describe, it, expect } from 'vitest'
import { parsePastedLines, parseCSV } from './batchRunner'
import { filterListings, getAverageRating } from './marketplace'

describe('batchRunner + marketplace combined', () => {
  it('parses agent names from CSV and finds them in listings', () => {
    const { rows } = parseCSV('Name,Category\nCode Writer,Data Processing\nBlog Generator,Content Generation')
    const listings = rows.map(([name, category]) => ({
      name,
      category,
      tags: [name.toLowerCase().replace(' ', '-')],
      ratingCount: 10,
      ratingTotal: 45,
    }))

    const results = filterListings(listings, { category: 'Data Processing' })
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Code Writer')
    expect(getAverageRating(results[0])).toBe(4.5)
  })

  it('processes pasted agent list and matches search', () => {
    const items = parsePastedLines('summarizer\nclassifier\ntranslator')
    const listings = items.map((name) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      category: 'Data Processing',
      tags: [name],
    }))

    const found = filterListings(listings, { search: 'class' })
    expect(found).toHaveLength(1)
    expect(found[0].name).toBe('Classifier')
  })
})
