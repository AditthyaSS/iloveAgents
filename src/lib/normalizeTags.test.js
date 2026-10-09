import { describe, it, expect } from 'vitest'
import { normalizeTags, normalizeListing } from './marketplace'

describe('normalizeTags', () => {
  it('lowercases, trims, and dedupes', () => {
    expect(normalizeTags(['Research', ' research ', 'RESEARCH', '', null, 42])).toEqual([
      'research',
      '42',
    ])
  })

  it('handles non-arrays', () => {
    expect(normalizeTags(null)).toEqual([])
    expect(normalizeTags(undefined)).toEqual([])
  })

  it('normalizeListing applies tag normalization', () => {
    expect(normalizeListing({ id: '1', tags: ['A', 'a'] }).tags).toEqual(['a'])
  })
})
