import { describe, it, expect } from 'vitest'
import { normalizeScore, tokenizeFreeText } from './scoring.js'
import { DEFAULT_RECOMMENDATION_WEIGHTS } from './constants.js'

describe('scoring — comprehensive normalizeScore edge cases', () => {
  it('score = maxScore returns exactly 100', () => {
    expect(normalizeScore(100, 100)).toBe(100)
  })

  it('score = 0 returns 0', () => {
    expect(normalizeScore(0, 100)).toBe(0)
  })

  it('score > maxScore is capped at 100', () => {
    expect(normalizeScore(150, 100)).toBe(100)
  })

  it('score = 1, maxScore = 3 rounds to 33', () => {
    expect(normalizeScore(1, 3)).toBe(33)
  })

  it('score = 2, maxScore = 3 rounds to 67', () => {
    expect(normalizeScore(2, 3)).toBe(67)
  })

  it('very small fractions round correctly', () => {
    expect(normalizeScore(1, 100)).toBe(1)
  })
})

describe('tokenizeFreeText — diverse inputs', () => {
  it('handles long descriptive text', () => {
    const tokens = tokenizeFreeText('generate high-quality blog posts for technical audience about machine learning')
    expect(tokens.length).toBeGreaterThan(0)
    expect(tokens.length).toBeLessThanOrEqual(12)
  })

  it('handles numbers mixed with words', () => {
    const tokens = tokenizeFreeText('gpt4 claude3 gemini2 models')
    expect(tokens).toContain('models')
  })

  it('handles hyphenated words', () => {
    const tokens = tokenizeFreeText('high-quality output fast-response generation')
    expect(tokens).toContain('generation')
  })

  it('results are lowercase', () => {
    const tokens = tokenizeFreeText('WRITE Generate CREATE')
    tokens.forEach((t) => expect(t).toBe(t.toLowerCase()))
  })
})

describe('DEFAULT_RECOMMENDATION_WEIGHTS invariants', () => {
  it('sum of all weights is between 50 and 200', () => {
    const sum = Object.values(DEFAULT_RECOMMENDATION_WEIGHTS).reduce((a, b) => a + b, 0)
    expect(sum).toBeGreaterThan(50)
    expect(sum).toBeLessThan(200)
  })

  it('no weight is larger than 50', () => {
    for (const w of Object.values(DEFAULT_RECOMMENDATION_WEIGHTS)) {
      expect(w).toBeLessThanOrEqual(50)
    }
  })
})
