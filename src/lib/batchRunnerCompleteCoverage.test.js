import { describe, it, expect } from 'vitest'
import { parsePastedLines, parseCSV } from './batchRunner'

describe('batchRunner — complete coverage scenarios', () => {
  describe('parsePastedLines with real-world text', () => {
    it('handles a list of company names', () => {
      const raw = 'Apple Inc.\nGoogle LLC\nMicrosoft Corp.\nAmazon Web Services\nMeta Platforms'
      const lines = parsePastedLines(raw)
      expect(lines).toHaveLength(5)
      expect(lines[0]).toBe('Apple Inc.')
    })

    it('handles a list of URLs', () => {
      const raw = 'https://example.com\nhttps://google.com\nhttps://github.com'
      const lines = parsePastedLines(raw)
      expect(lines[0]).toBe('https://example.com')
      expect(lines).toHaveLength(3)
    })

    it('handles mixed content (some blank lines)', () => {
      const raw = 'First item\n\nSecond item\n   \nThird item'
      const lines = parsePastedLines(raw)
      expect(lines).toHaveLength(3)
    })
  })

  describe('parseCSV with real-world data', () => {
    it('parses a 3-column CSV', () => {
      const csv = 'Name,Role,Department\nAlice,Engineer,R&D\nBob,Manager,Sales'
      const { rows } = parseCSV(csv)
      expect(rows).toHaveLength(3)
      expect(rows[0]).toEqual(['Name', 'Role', 'Department'])
    })

    it('handles CSV with commas inside quotes', () => {
      const csv = '"Smith, John",Engineer,R&D'
      const { rows } = parseCSV(csv)
      expect(rows[0][0]).toBe('Smith, John')
    })

    it('handles a single-row CSV', () => {
      const { rows } = parseCSV('one,two,three')
      expect(rows).toHaveLength(1)
      expect(rows[0]).toHaveLength(3)
    })

    it('returns empty for whitespace-only input', () => {
      const { rows } = parseCSV('  \n  \n  ')
      const nonEmpty = rows.filter((r) => r.some((c) => c.trim()))
      expect(nonEmpty).toHaveLength(0)
    })
  })
})
