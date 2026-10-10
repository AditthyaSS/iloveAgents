import { describe, it, expect } from 'vitest'
import { parsePastedLines, buildBatchUserMessage } from './batchRunner'

const AGENT = {
  inputs: [
    { id: 'prompt', label: 'Prompt' },
    { id: 'context', label: 'Context' }
  ]
}

describe('batchRunner — sanitization and edge inputs', () => {
  describe('parsePastedLines special inputs', () => {
    it('handles HTML content in lines', () => {
      const lines = parsePastedLines('<div>Hello</div>\n<b>World</b>')
      expect(lines).toHaveLength(2)
      expect(lines[0]).toBe('<div>Hello</div>')
    })

    it('handles JSON content in lines', () => {
      const json = '{"key": "value"}\n{"other": 42}'
      const lines = parsePastedLines(json)
      expect(lines).toHaveLength(2)
      expect(lines[0]).toContain('key')
    })

    it('handles SQL content in lines', () => {
      const sql = "SELECT * FROM users\nDROP TABLE users;"
      const lines = parsePastedLines(sql)
      expect(lines).toHaveLength(2)
    })

    it('handles very long single line', () => {
      const long = 'x'.repeat(10000)
      const lines = parsePastedLines(long)
      expect(lines).toHaveLength(1)
      expect(lines[0]).toHaveLength(10000)
    })
  })

  describe('buildBatchUserMessage with special content', () => {
    it('handles markdown in item value', () => {
      const msg = buildBatchUserMessage(AGENT, {}, 'prompt', '## Header\n**bold**')
      expect(msg).toContain('## Header')
    })

    it('handles special characters in context', () => {
      const msg = buildBatchUserMessage(AGENT, { context: 'Cost: $10.99 (20% off)' }, 'prompt', 'item')
      expect(msg).toContain('$10.99')
    })

    it('handles numbers in item value', () => {
      const msg = buildBatchUserMessage(AGENT, {}, 'prompt', '42')
      expect(msg).toContain('42')
    })
  })
})
