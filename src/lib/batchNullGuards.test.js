import { describe, it, expect } from 'vitest'
import { parsePastedLines, parseCSV, buildBatchUserMessage } from './batchRunner'

describe('batchRunner null guards', () => {
  it('parses nothing into empty results', () => {
    expect(parsePastedLines(null)).toEqual([])
    expect(parsePastedLines(undefined)).toEqual([])
    expect(parsePastedLines('')).toEqual([])
    expect(parseCSV(null)).toEqual({ headers: null, rows: [] })
    expect(parseCSV('')).toEqual({ headers: null, rows: [] })
  })

  it('builds messages from malformed agents without throwing', () => {
    expect(buildBatchUserMessage(null, {}, 'f', 'v')).toBe('')
    expect(buildBatchUserMessage({}, null, 'f', 'v')).toBe('')
    expect(buildBatchUserMessage({ inputs: null }, {}, 'f', 'v')).toBe('')
  })

  it('still parses and builds valid input', () => {
    expect(parsePastedLines('a\n\nb')).toEqual(['a', 'b'])
    const agent = {
      inputs: [{ id: 'topic', label: 'Topic' }],
    }
    expect(buildBatchUserMessage(agent, {}, 'topic', 'dogs')).toContain('dogs')
  })
})
