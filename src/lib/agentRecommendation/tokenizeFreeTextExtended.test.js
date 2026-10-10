import { describe, it, expect } from 'vitest'
import { tokenizeFreeText } from './scoring.js'

describe('tokenizeFreeText — comprehensive input scenarios', () => {
  describe('standard NLP input', () => {
    it('tokenizes developer workflow phrase', () => {
      const tokens = tokenizeFreeText('write unit tests for React components')
      expect(tokens).toContain('write')
      expect(tokens).toContain('unit')
      expect(tokens).toContain('tests')
      expect(tokens).toContain('react')
      expect(tokens).toContain('components')
    })

    it('removes stop words like "for", "the", "and"', () => {
      const tokens = tokenizeFreeText('analyze the data and find patterns')
      expect(tokens).not.toContain('the')
      expect(tokens).not.toContain('and')
      expect(tokens).toContain('analyze')
    })

    it('filters short tokens (2 chars or less)', () => {
      const tokens = tokenizeFreeText('AI ML NLP data science')
      expect(tokens).not.toContain('ai')
      expect(tokens).not.toContain('ml')
      expect(tokens).not.toContain('nlp')
      expect(tokens).toContain('data')
    })
  })

  describe('punctuation and special chars', () => {
    it('handles commas as separators', () => {
      const tokens = tokenizeFreeText('write, debug, test')
      expect(tokens).toContain('write')
      expect(tokens).toContain('debug')
      expect(tokens).toContain('test')
    })

    it('handles parentheses', () => {
      const tokens = tokenizeFreeText('generate (unit) tests')
      expect(tokens).toContain('generate')
      expect(tokens).toContain('unit')
      expect(tokens).toContain('tests')
    })
  })

  describe('limit and edge cases', () => {
    it('strips excess tokens beyond 12', () => {
      const input = Array.from({ length: 20 }, (_, i) => `word${String(i).padStart(2,'0')}`).join(' ')
      const tokens = tokenizeFreeText(input)
      expect(tokens.length).toBeLessThanOrEqual(12)
    })

    it('null input returns empty array', () => {
      expect(tokenizeFreeText(null)).toEqual([])
    })

    it('number input returns empty array', () => {
      expect(tokenizeFreeText(42)).toEqual([])
    })

    it('all stop-word input returns empty', () => {
      const tokens = tokenizeFreeText('the a an to of')
      expect(tokens.length).toBe(0)
    })
  })
})
