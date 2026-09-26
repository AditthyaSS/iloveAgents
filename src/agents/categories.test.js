import { describe, it, expect } from 'vitest'
import { CATEGORIES } from './categories'

describe('CATEGORIES', () => {
  it('should be a non-empty array', () => {
    expect(Array.isArray(CATEGORIES)).toBe(true)
    expect(CATEGORIES.length).toBeGreaterThan(0)
  })

  it('should contain only strings', () => {
    CATEGORIES.forEach((category) => {
      expect(typeof category).toBe('string')
    })
  })

  it('should not have duplicates', () => {
    const unique = new Set(CATEGORIES)
    expect(unique.size).toBe(CATEGORIES.length)
  })

  it('should include core categories', () => {
    expect(CATEGORIES).toContain('Engineering')
    expect(CATEGORIES).toContain('Education')
    expect(CATEGORIES).toContain('Productivity')
    expect(CATEGORIES).toContain('Design')
    expect(CATEGORIES).toContain('Marketing')
  })
})
