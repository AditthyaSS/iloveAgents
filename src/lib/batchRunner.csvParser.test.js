import { describe, it, expect } from 'vitest'
import { parsePastedLines, parseCSV } from './batchRunner.js'

describe('parsePastedLines', () => {
  it('splits input by newline', () => {
    const lines = parsePastedLines('line1\nline2\nline3')
    expect(lines).toEqual(['line1', 'line2', 'line3'])
  })

  it('trims whitespace from each line', () => {
    const lines = parsePastedLines('  hello  \n  world  ')
    expect(lines).toEqual(['hello', 'world'])
  })

  it('filters out blank lines', () => {
    const lines = parsePastedLines('a\n\nb\n  \nc')
    expect(lines).toEqual(['a', 'b', 'c'])
  })

  it('returns empty array for empty string', () => {
    expect(parsePastedLines('')).toEqual([])
  })

  it('returns empty array for whitespace-only string', () => {
    expect(parsePastedLines('   \n  \n')).toEqual([])
  })

  it('handles Windows-style line endings (CRLF) treated as one newline', () => {
    // \r is not stripped by parsePastedLines — \r\n splits at \n, leaving \r in the line
    // which gets trimmed. Test that trimming handles \r.
    const lines = parsePastedLines('line1\r\nline2\r\n')
    expect(lines).toContain('line1')
    expect(lines).toContain('line2')
  })

  it('handles single-line input', () => {
    expect(parsePastedLines('only one')).toEqual(['only one'])
  })
})

describe('parseCSV', () => {
  it('returns rows as 2D array', () => {
    const { rows } = parseCSV('a,b,c\n1,2,3')
    expect(rows).toEqual([['a', 'b', 'c'], ['1', '2', '3']])
  })

  it('handles quoted fields', () => {
    const { rows } = parseCSV('"hello world","foo","bar"')
    expect(rows[0]).toEqual(['hello world', 'foo', 'bar'])
  })

  it('handles commas inside quoted fields', () => {
    const { rows } = parseCSV('"a,b","c,d"')
    expect(rows[0]).toEqual(['a,b', 'c,d'])
  })

  it('handles escaped double quotes ("")', () => {
    const { rows } = parseCSV('"say ""hi"""')
    expect(rows[0][0]).toBe('say "hi"')
  })

  it('handles multiple rows', () => {
    const { rows } = parseCSV('x,y\n1,2\n3,4')
    expect(rows.length).toBe(3)
  })

  it('filters out entirely empty rows', () => {
    const { rows } = parseCSV('a,b\n\n1,2')
    // empty row should be excluded
    expect(rows.every(r => r.some(cell => cell.trim() !== ''))).toBe(true)
  })

  it('handles CRLF line endings', () => {
    const { rows } = parseCSV('a,b\r\n1,2\r\n')
    expect(rows.length).toBeGreaterThanOrEqual(1)
    expect(rows[0]).toEqual(['a', 'b'])
  })

  it('returns empty rows array for empty input', () => {
    const { rows } = parseCSV('')
    expect(rows).toEqual([])
  })

  it('handles single value with no commas', () => {
    const { rows } = parseCSV('hello')
    expect(rows[0]).toEqual(['hello'])
  })

  it('handles trailing comma', () => {
    const { rows } = parseCSV('a,b,\n1,2,')
    expect(rows[0]).toHaveLength(3)
    expect(rows[0][2]).toBe('')
  })

  it('handles multi-line quoted fields', () => {
    const { rows } = parseCSV('"line1\nline2",second')
    expect(rows[0][0]).toContain('line1')
    expect(rows[0][0]).toContain('line2')
    expect(rows[0][1]).toBe('second')
  })
})
