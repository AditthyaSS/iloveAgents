import { describe, it, expect } from 'vitest'
import { parsePastedLines, parseCSV, buildBatchUserMessage } from './batchRunner'

describe('batchRunner — all exported functions available', () => {
  it('parsePastedLines is a function', () => {
    expect(typeof parsePastedLines).toBe('function')
  })

  it('parseCSV is a function', () => {
    expect(typeof parseCSV).toBe('function')
  })

  it('buildBatchUserMessage is a function', () => {
    expect(typeof buildBatchUserMessage).toBe('function')
  })
})

describe('batchRunner — return type validation', () => {
  it('parsePastedLines always returns an array', () => {
    expect(Array.isArray(parsePastedLines(''))).toBe(true)
    expect(Array.isArray(parsePastedLines('item1\nitem2'))).toBe(true)
  })

  it('parseCSV always returns an object with rows array', () => {
    const { rows } = parseCSV('')
    expect(Array.isArray(rows)).toBe(true)
  })

  it('buildBatchUserMessage always returns a string', () => {
    const agent = { inputs: [{ id: 'input', label: 'Input' }] }
    const result = buildBatchUserMessage(agent, {}, 'input', 'test')
    expect(typeof result).toBe('string')
  })
})

describe('batchRunner — no side effects', () => {
  it('parsePastedLines does not modify input', () => {
    const input = 'line1\nline2'
    parsePastedLines(input)
    expect(input).toBe('line1\nline2')
  })

  it('parseCSV does not modify input', () => {
    const csv = 'a,b\nc,d'
    parseCSV(csv)
    expect(csv).toBe('a,b\nc,d')
  })
})
