import { describe, it, expect } from 'vitest'
import { sanitizeAgentConfig, filterListings, getAverageRating, MARKETPLACE_CATEGORIES } from './marketplace'

describe('marketplace — all exports available', () => {
  it('sanitizeAgentConfig is a function', () => expect(typeof sanitizeAgentConfig).toBe('function'))
  it('filterListings is a function', () => expect(typeof filterListings).toBe('function'))
  it('getAverageRating is a function', () => expect(typeof getAverageRating).toBe('function'))
  it('MARKETPLACE_CATEGORIES is an array', () => expect(Array.isArray(MARKETPLACE_CATEGORIES)).toBe(true))
})

describe('marketplace — return type guarantees', () => {
  it('sanitizeAgentConfig returns object with config and sanitizedFields', () => {
    const result = sanitizeAgentConfig({ name: 'test' })
    expect(result).toHaveProperty('config')
    expect(result).toHaveProperty('sanitizedFields')
    expect(Array.isArray(result.sanitizedFields)).toBe(true)
  })

  it('filterListings always returns an array', () => {
    expect(Array.isArray(filterListings([]))).toBe(true)
    expect(Array.isArray(filterListings([], { search: 'x' }))).toBe(true)
  })

  it('getAverageRating always returns a number', () => {
    expect(typeof getAverageRating(null)).toBe('number')
    expect(typeof getAverageRating({ ratingCount: 5, ratingTotal: 25 })).toBe('number')
  })
})
