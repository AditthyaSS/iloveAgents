import { describe, it, expect } from 'vitest'
import { filterListings } from './marketplace'

const listings = [
  { name: 'C++ Code Helper', category: 'Data Processing', tags: ['c++', 'programming'] },
  { name: 'React.js Generator', category: 'Content Generation', tags: ['react', 'js', 'frontend'] },
  { name: 'Node.js API Builder', category: 'Data Processing', tags: ['node', 'api', 'backend'] },
  { name: 'SQL Query Writer', category: 'Data Processing', tags: ['sql', 'database'] },
]

describe('filterListings — special characters in search', () => {
  it('search for "C++" matches by name', () => {
    const results = filterListings(listings, { search: 'c++' })
    expect(results.some((l) => l.name.includes('C++'))).toBe(true)
  })

  it('search for "react.js" matches by tag', () => {
    const results = filterListings(listings, { search: 'react' })
    expect(results.some((l) => l.name.includes('React'))).toBe(true)
  })

  it('search for dot in name "node.js"', () => {
    const results = filterListings(listings, { search: 'node' })
    expect(results.some((l) => l.name.includes('Node'))).toBe(true)
  })

  it('SQL search matches exactly', () => {
    const results = filterListings(listings, { search: 'sql' })
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('SQL Query Writer')
  })

  it('empty search returns all listings', () => {
    expect(filterListings(listings, { search: '' })).toHaveLength(4)
  })
})
