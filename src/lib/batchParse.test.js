import { describe, it, expect } from 'vitest'
import { parsePastedLines, parseCSV } from './batchRunner'

describe('batchRunner parsing guards', () => {
  it('parses pasted lines normally', () => {
    expect(parsePastedLines('a\n\nb ')).toEqual(['a', 'b'])
  })

  it('returns empty for non string input instead of throwing', () => {
    expect(parsePastedLines(undefined)).toEqual([])
    expect(parsePastedLines(null)).toEqual([])
    expect(parsePastedLines(42)).toEqual([])
  })

  it('documents the real csv shape', () => {
    const parsed = parseCSV('a,b\nc,d')
    expect(Object.keys(parsed).sort()).toEqual(['rows'])
    expect(parsed.rows).toEqual([['a', 'b'], ['c', 'd']])
  })
})
