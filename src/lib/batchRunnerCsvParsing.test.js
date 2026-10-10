import { describe, it, expect } from 'vitest'
import { parseCSV } from './batchRunner'

describe('parseCSV — complete parsing scenarios', () => {
  describe('headers detection', () => {
    it('first row is treated as a row (not auto-detected as header)', () => {
      const { rows } = parseCSV('Name,Age,City\nAlice,30,NYC')
      expect(rows).toHaveLength(2)
      expect(rows[0]).toEqual(['Name', 'Age', 'City'])
      expect(rows[1]).toEqual(['Alice', '30', 'NYC'])
    })
  })

  describe('real-world CSV formats', () => {
    it('parses email list', () => {
      const csv = 'alice@example.com\nbob@example.com\ncharlie@example.com'
      const { rows } = parseCSV(csv)
      expect(rows).toHaveLength(3)
      expect(rows[0][0]).toBe('alice@example.com')
    })

    it('parses mixed content with numbers', () => {
      const { rows } = parseCSV('Product,Price,Qty\nWidget,9.99,100\nGadget,24.50,25')
      const priceRow = rows[1]
      expect(priceRow[1]).toBe('9.99')
    })

    it('handles apostrophes in content', () => {
      const { rows } = parseCSV("Don't panic,value")
      expect(rows[0][0]).toBe("Don't panic")
    })

    it('handles URLs as field values', () => {
      const { rows } = parseCSV('Title,URL\nDocs,https://docs.example.com/guide')
      expect(rows[1][1]).toBe('https://docs.example.com/guide')
    })
  })

  describe('row count accuracy', () => {
    it('exact row count matches input lines', () => {
      const csv = Array.from({ length: 5 }, (_, i) => `row${i},val${i}`).join('\n')
      const { rows } = parseCSV(csv)
      expect(rows).toHaveLength(5)
    })

    it('trims trailing newline to not add extra row', () => {
      const { rows } = parseCSV('a,b\nc,d\n')
      expect(rows).toHaveLength(2)
    })
  })
})
