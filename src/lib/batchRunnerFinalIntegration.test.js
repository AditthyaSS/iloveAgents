import { describe, it, expect } from 'vitest'
import { parsePastedLines, parseCSV, buildBatchUserMessage } from './batchRunner'

const AGENT = {
  inputs: [
    { id: 'input', label: 'Input' },
    { id: 'style', label: 'Style' },
    { id: 'length', label: 'Target Length' },
  ]
}

describe('batchRunner — final integration verification', () => {
  it('all 3 exports are functions that return expected types', () => {
    expect(typeof parsePastedLines).toBe('function')
    expect(typeof parseCSV).toBe('function')
    expect(typeof buildBatchUserMessage).toBe('function')

    expect(Array.isArray(parsePastedLines(''))).toBe(true)
    expect(typeof parseCSV('').rows).toBe('object')
    expect(typeof buildBatchUserMessage(AGENT, {}, 'input', '')).toBe('string')
  })

  it('pipeline: paste → messages → all unique when items differ', () => {
    const items = parsePastedLines('AI Ethics\nClimate Change\nQuantum Computing')
    const messages = items.map((item) =>
      buildBatchUserMessage(AGENT, { style: 'academic', length: '500 words' }, 'input', item)
    )
    const unique = new Set(messages)
    expect(unique.size).toBe(3) // all different because items differ
  })

  it('pipeline: CSV → messages → includes all fixed inputs', () => {
    const { rows } = parseCSV('Topic\nMachine Learning\nDeep Learning')
    const messages = rows.map((row) =>
      buildBatchUserMessage(AGENT, { style: 'informal', length: '200' }, 'input', row[0])
    )
    for (const msg of messages) {
      expect(msg).toContain('Style: informal')
      expect(msg).toContain('Target Length: 200')
    }
  })

  it('handles empty batch gracefully', () => {
    const items = parsePastedLines('')
    const messages = items.map((item) =>
      buildBatchUserMessage(AGENT, {}, 'input', item)
    )
    expect(messages).toHaveLength(0)
  })
})
