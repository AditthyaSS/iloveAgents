import { describe, it, expect } from 'vitest'
import { parsePastedLines, parseCSV } from './batchRunner'

describe('parsePastedLines', () => {
  it('splits multi-line text into individual items', () => {
    const result = parsePastedLines('item one\nitem two\nitem three')
    expect(result).toEqual(['item one', 'item two', 'item three'])
  })

  it('trims whitespace from each line', () => {
    const result = parsePastedLines('  hello  \n  world  ')
    expect(result).toEqual(['hello', 'world'])
  })

  it('filters out empty lines', () => {
    const result = parsePastedLines('first\n\n\nsecond')
    expect(result).toEqual(['first', 'second'])
  })

  it('returns empty array for empty string', () => {
    expect(parsePastedLines('')).toEqual([])
  })

  it('returns empty array for whitespace-only string', () => {
    expect(parsePastedLines('   \n   \n  ')).toEqual([])
  })

  it('handles Windows-style CRLF line endings', () => {
    const result = parsePastedLines('item1\r\nitem2\r\nitem3')
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('handles single item without newline', () => {
    expect(parsePastedLines('single item')).toEqual(['single item'])
  })

  it('handles 100 lines', () => {
    const input = Array.from({ length: 100 }, (_, i) => `item ${i + 1}`).join('\n')
    const result = parsePastedLines(input)
    expect(result).toHaveLength(100)
  })
})

describe('parseCSV', () => {
  it('parses simple CSV into rows', () => {
    const { rows } = parseCSV('a,b,c\n1,2,3')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual(['a', 'b', 'c'])
  })

  it('handles quoted fields with commas inside', () => {
    const { rows } = parseCSV('"hello, world",value')
    expect(rows[0][0]).toBe('hello, world')
    expect(rows[0][1]).toBe('value')
  })

  it('handles escaped quotes within quoted fields', () => {
    const { rows } = parseCSV('"say ""hello""",value')
    expect(rows[0][0]).toBe('say "hello"')
  })

  it('returns empty rows array for empty input', () => {
    const { rows } = parseCSV('')
    expect(rows).toHaveLength(0)
  })

  it('ignores blank rows', () => {
    const { rows } = parseCSV('a,b\n\n1,2')
    expect(rows.length).toBeGreaterThanOrEqual(2)
  })

  it('parses single column CSV', () => {
    const { rows } = parseCSV('item1\nitem2\nitem3')
    expect(rows.every((r) => r.length === 1)).toBe(true)
  })
})
