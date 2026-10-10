import { describe, it, expect } from 'vitest'
import { normalizeScore, tokenizeFreeText } from './scoring.js'

describe('normalizeScore — all edge cases verified', () => {
  it('0 → 0', () => expect(normalizeScore(0, 100)).toBe(0))
  it('50 → 50', () => expect(normalizeScore(50, 100)).toBe(50))
  it('100 → 100', () => expect(normalizeScore(100, 100)).toBe(100))
  it('over 100 → capped at 100', () => expect(normalizeScore(200, 100)).toBe(100))
  it('negative → 0', () => expect(normalizeScore(-10, 100)).toBe(0))
  it('NaN → 0', () => expect(normalizeScore(NaN, 100)).toBe(0))
  it('zero maxScore → 0', () => expect(normalizeScore(10, 0)).toBe(0))
  it('1/3 rounds to 33', () => expect(normalizeScore(1, 3)).toBe(33))
  it('2/3 rounds to 67', () => expect(normalizeScore(2, 3)).toBe(67))
  it('result is always integer', () => {
    [0, 25, 33, 50, 67, 75, 100].forEach((expected) => {
      const result = normalizeScore(expected, 100)
      expect(Number.isInteger(result)).toBe(true)
    })
  })
})

describe('tokenizeFreeText — final verification', () => {
  it('returns empty array for empty string', () => {
    expect(tokenizeFreeText('')).toEqual([])
  })
  it('returns at most 12 tokens', () => {
    const longText = 'write blog posts for technical developers about machine learning artificial intelligence automation pipeline'
    expect(tokenizeFreeText(longText).length).toBeLessThanOrEqual(12)
  })
  it('all tokens are lowercase', () => {
    const tokens = tokenizeFreeText('WRITE GENERATE Create BUILD Deploy')
    tokens.forEach((t) => expect(t).toBe(t.toLowerCase()))
  })
  it('removes tokens of 2 chars or less', () => {
    const tokens = tokenizeFreeText('AI ML use the to')
    tokens.forEach((t) => expect(t.length).toBeGreaterThan(2))
  })
})
