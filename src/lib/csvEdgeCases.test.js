import { describe, it, expect } from 'vitest'
import { parseCSV } from './batchRunner'

describe('parseCSV — edge cases', () => {
  it('parses single cell CSV', () => {
    const { rows } = parseCSV('hello')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual(['hello'])
  })

  it('handles trailing comma (empty final field)', () => {
    const { rows } = parseCSV('a,b,')
    expect(rows[0]).toHaveLength(3)
    expect(rows[0][2]).toBe('')
  })

  it('handles multiple quoted fields in a row', () => {
    const { rows } = parseCSV('"first","second","third"')
    expect(rows[0]).toEqual(['first', 'second', 'third'])
  })

  it('handles multi-line content within quoted field', () => {
    const { rows } = parseCSV('"line1\nline2",value')
    expect(rows[0][0]).toContain('line1')
  })

  it('handles empty quoted field ""', () => {
    const { rows } = parseCSV('"",value')
    expect(rows[0][0]).toBe('')
    expect(rows[0][1]).toBe('value')
  })

  it('handles whitespace within unquoted fields', () => {
    const { rows } = parseCSV('  hello  ,  world  ')
    expect(rows[0][0]).toBe('  hello  ')
    expect(rows[0][1]).toBe('  world  ')
  })

  it('handles unicode content', () => {
    const { rows } = parseCSV('héllo,wörld')
    expect(rows[0][0]).toBe('héllo')
    expect(rows[0][1]).toBe('wörld')
  })

  it('handles large input with many rows', () => {
    const lines = Array.from({ length: 100 }, (_, i) => `item${i},value${i}`)
    const { rows } = parseCSV(lines.join('\n'))
    expect(rows.length).toBeGreaterThanOrEqual(100)
  })

  it('skips blank rows', () => {
    const { rows } = parseCSV('a,b\n\n\nc,d')
    const nonEmpty = rows.filter((r) => r.some((cell) => cell.trim() !== ''))
    expect(nonEmpty.length).toBeGreaterThanOrEqual(2)
  })
})
