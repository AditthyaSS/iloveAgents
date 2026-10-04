import { describe, it, expect } from 'vitest'
import { parsePastedLines, parseCSV } from './batchRunner'

describe('batchRunner — Unicode and international content', () => {
  describe('parsePastedLines', () => {
    it('handles Japanese text', () => {
      const items = parsePastedLines('東京\n大阪\n京都')
      expect(items).toHaveLength(3)
      expect(items[0]).toBe('東京')
    })

    it('handles Arabic text', () => {
      const items = parsePastedLines('مرحبا\nعالم')
      expect(items).toHaveLength(2)
    })

    it('handles emoji content', () => {
      const items = parsePastedLines('Hello 👋\nWorld 🌍')
      expect(items).toHaveLength(2)
      expect(items[0]).toBe('Hello 👋')
    })

    it('handles mixed Unicode and ASCII', () => {
      const items = parsePastedLines('café\nnaïve\nrésumé')
      expect(items).toHaveLength(3)
      expect(items[0]).toBe('café')
    })
  })

  describe('parseCSV', () => {
    it('handles Unicode in CSV fields', () => {
      const { rows } = parseCSV('name,city\n田中,東京\nSmith,London')
      expect(rows).toHaveLength(2)
      expect(rows[0][1]).toBe('東京')
    })

    it('handles emojis in CSV', () => {
      const { rows } = parseCSV('mood\n😀\n😢')
      expect(rows).toHaveLength(2)
      expect(rows[0][0]).toBe('😀')
    })
  })
})
