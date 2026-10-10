import { describe, it, expect } from 'vitest'
import { parsePastedLines, parseCSV, buildBatchUserMessage } from './batchRunner'

const MOCK_AGENT = {
  inputs: [
    { id: 'topic', label: 'Topic' },
    { id: 'style', label: 'Style' },
  ],
}

describe('batchRunner — integration scenarios', () => {
  describe('pasted lines → batch items', () => {
    it('parses 5 topics from pasted text', () => {
      const raw = 'AI in healthcare\nClimate change solutions\nQuantum computing basics\nRemote work trends\nCybersecurity best practices'
      const items = parsePastedLines(raw)
      expect(items).toHaveLength(5)
      expect(items[0]).toBe('AI in healthcare')
    })

    it('each item becomes a user message', () => {
      const items = parsePastedLines('Topic One\nTopic Two')
      const messages = items.map((item) =>
        buildBatchUserMessage(MOCK_AGENT, { style: 'formal' }, 'topic', item)
      )
      expect(messages).toHaveLength(2)
      expect(messages[0]).toContain('Topic One')
      expect(messages[1]).toContain('Topic Two')
    })
  })

  describe('CSV → batch items', () => {
    it('parses CSV and uses first column as batch field', () => {
      const csv = 'Topic,Language\nMachine Learning,English\nDeep Learning,French'
      const { rows } = parseCSV(csv)
      const items = rows.map((r) => r[0])
      expect(items[0]).toBe('Topic')
      expect(items[1]).toBe('Machine Learning')
    })

    it('builds user message for each CSV row item', () => {
      const { rows } = parseCSV('Quantum Physics\nNeural Networks\nBlockchain')
      const messages = rows.map((row) =>
        buildBatchUserMessage(MOCK_AGENT, { style: 'casual' }, 'topic', row[0])
      )
      expect(messages).toHaveLength(3)
      for (const msg of messages) {
        expect(msg).toContain('Topic:')
        expect(msg).toContain('Style: casual')
      }
    })
  })
})
