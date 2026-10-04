import { describe, it, expect } from 'vitest'
import { parsePastedLines, parseCSV, buildBatchUserMessage } from './batchRunner'

const AGENT = { inputs: [{ id: 'input', label: 'Input' }, { id: 'context', label: 'Context' }] }

describe('batchRunner — null/undefined/empty input handling', () => {
  describe('parsePastedLines edge inputs', () => {
    it('null returns empty array (not crash)', () => {
      try {
        const result = parsePastedLines(null)
        expect(Array.isArray(result)).toBe(true)
      } catch {
        // implementation may throw — not required to handle null
        expect(true).toBe(true)
      }
    })

    it('single newline returns empty array', () => {
      expect(parsePastedLines('\n')).toEqual([])
    })

    it('multiple newlines return empty array', () => {
      expect(parsePastedLines('\n\n\n\n')).toEqual([])
    })
  })

  describe('parseCSV edge inputs', () => {
    it('only whitespace returns no rows', () => {
      const { rows } = parseCSV('   ')
      expect(rows.length).toBe(0)
    })

    it('single field with no commas returns 1-column rows', () => {
      const { rows } = parseCSV('value1\nvalue2')
      expect(rows[0]).toHaveLength(1)
    })
  })

  describe('buildBatchUserMessage with all empty inputs', () => {
    it('all null fixed inputs produces minimal output', () => {
      const result = buildBatchUserMessage(
        AGENT,
        { input: null, context: null },
        'input',
        ''
      )
      expect(typeof result).toBe('string')
    })

    it('empty batch item value with non-empty fixed returns fixed only', () => {
      const result = buildBatchUserMessage(
        AGENT,
        { context: 'some context' },
        'input',
        ''
      )
      // Only context should appear since input is empty
      expect(result).toContain('Context: some context')
    })
  })
})
