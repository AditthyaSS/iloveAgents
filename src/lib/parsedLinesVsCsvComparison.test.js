import { describe, it, expect } from 'vitest'
import { parsePastedLines, parseCSV } from './batchRunner'

describe('parsePastedLines vs parseCSV — format comparison', () => {
  describe('Single-column data', () => {
    it('parsePastedLines returns flat strings', () => {
      const items = parsePastedLines('apple\nbanana\ncherry')
      expect(items).toEqual(['apple', 'banana', 'cherry'])
    })

    it('parseCSV returns nested arrays', () => {
      const { rows } = parseCSV('apple\nbanana\ncherry')
      expect(rows).toEqual([['apple'], ['banana'], ['cherry']])
    })
  })

  describe('Multi-column data', () => {
    it('parsePastedLines treats commas as content', () => {
      const items = parsePastedLines('Smith, John\nDoe, Jane')
      expect(items[0]).toBe('Smith, John')
    })

    it('parseCSV splits on commas', () => {
      const { rows } = parseCSV('Smith,John\nDoe,Jane')
      expect(rows[0]).toEqual(['Smith', 'John'])
    })
  })

  describe('Empty handling', () => {
    it('both return empty for empty input', () => {
      expect(parsePastedLines('')).toEqual([])
      expect(parseCSV('').rows).toHaveLength(0)
    })

    it('parsePastedLines filters blank lines, parseCSV skips empty rows', () => {
      const pastedResult = parsePastedLines('a\n\nb')
      expect(pastedResult).toHaveLength(2)

      const csvResult = parseCSV('a\n\nb')
      expect(csvResult.rows.filter((r) => r.some((c) => c.trim())).length).toBe(2)
    })
  })
})
