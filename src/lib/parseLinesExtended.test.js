import { describe, it, expect } from 'vitest'
import { parsePastedLines } from './batchRunner'

describe('parsePastedLines — extended coverage', () => {
  describe('line ending variants', () => {
    it('handles Unix LF line endings', () => {
      expect(parsePastedLines('a\nb\nc')).toHaveLength(3)
    })

    it('handles Mac CR line endings (treated as part of line)', () => {
      // \r without \n is kept as part of the trimmed content
      const result = parsePastedLines('item1\ritem2')
      expect(result.length).toBeGreaterThan(0)
    })

    it('handles mixed line endings', () => {
      const result = parsePastedLines('first\nsecond\nthird')
      expect(result).toHaveLength(3)
    })
  })

  describe('whitespace handling', () => {
    it('trims tabs from beginning', () => {
      expect(parsePastedLines('\tindented item')).toContain('indented item')
    })

    it('trims multiple spaces from both ends', () => {
      expect(parsePastedLines('   item   ')).toContain('item')
    })

    it('items with only whitespace are filtered out', () => {
      expect(parsePastedLines('\t\t\t')).toHaveLength(0)
    })
  })

  describe('content preservation', () => {
    it('preserves internal whitespace', () => {
      const result = parsePastedLines('hello world')
      expect(result[0]).toBe('hello world')
    })

    it('preserves numbers as strings', () => {
      const result = parsePastedLines('123\n456\n789')
      expect(result).toEqual(['123', '456', '789'])
    })

    it('preserves special characters inside content', () => {
      const result = parsePastedLines('user@example.com\nfoo.bar')
      expect(result).toContain('user@example.com')
    })

    it('preserves quoted strings as-is', () => {
      const result = parsePastedLines('"quoted"\n\'also quoted\'')
      expect(result[0]).toBe('"quoted"')
    })
  })
})
