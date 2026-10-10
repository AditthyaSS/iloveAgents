import { describe, it, expect } from 'vitest'
import { tokenizeFreeText, normalizeScore } from './scoring.js'

describe('tokenizeFreeText', () => {
  it('tokenizes simple sentence', () => {
    const tokens = tokenizeFreeText('write blog posts content')
    expect(tokens).toContain('write')
    expect(tokens).toContain('blog')
    expect(tokens).toContain('posts')
    expect(tokens).toContain('content')
  })

  it('removes stop words', () => {
    const tokens = tokenizeFreeText('the quick brown fox')
    expect(tokens).not.toContain('the')
    // Short words (≤2 chars) are also removed
  })

  it('filters out tokens of 2 chars or less', () => {
    const tokens = tokenizeFreeText('AI ML data')
    // AI and ML are 2 chars → filtered; data passes
    expect(tokens).not.toContain('ai')
    expect(tokens).not.toContain('ml')
  })

  it('returns empty array for empty string', () => {
    expect(tokenizeFreeText('')).toEqual([])
  })

  it('returns empty array for undefined', () => {
    expect(tokenizeFreeText(undefined)).toEqual([])
  })

  it('limits to 12 tokens max', () => {
    const longText = Array.from({ length: 20 }, (_, i) => `word${i}`).join(' ')
    expect(tokenizeFreeText(longText).length).toBeLessThanOrEqual(12)
  })

  it('lowercases all tokens', () => {
    const tokens = tokenizeFreeText('WRITE BLOG')
    expect(tokens.every((t) => t === t.toLowerCase())).toBe(true)
  })

  it('handles special characters in text', () => {
    const tokens = tokenizeFreeText('C++ programming and React.js')
    expect(tokens).toContain('react.js')
    // C++ should be split or included depending on regex
    expect(tokens.some((t) => t.includes('c+'))).toBe(true)
  })
})

describe('normalizeScore', () => {
  it('returns 100 for score equal to maxScore', () => {
    expect(normalizeScore(50, 50)).toBe(100)
  })

  it('returns 50 for score half of maxScore', () => {
    expect(normalizeScore(25, 50)).toBe(50)
  })

  it('returns 0 for score of 0', () => {
    expect(normalizeScore(0, 50)).toBe(0)
  })

  it('returns 0 for negative score', () => {
    expect(normalizeScore(-10, 50)).toBe(0)
  })

  it('caps at 100 for score > maxScore', () => {
    expect(normalizeScore(60, 50)).toBe(100)
  })

  it('returns 0 for Infinity score', () => {
    expect(normalizeScore(Infinity, 50)).toBe(0)
  })

  it('returns 0 for NaN score', () => {
    expect(normalizeScore(NaN, 50)).toBe(0)
  })

  it('returns 0 for zero maxScore', () => {
    expect(normalizeScore(10, 0)).toBe(0)
  })
})
