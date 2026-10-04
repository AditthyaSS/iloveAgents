import { describe, it, expect } from 'vitest'
import { parsePastedLines, parseCSV, buildBatchUserMessage } from './batchRunner'

const agent = {
  inputs: [
    { id: 'topic', label: 'Topic', type: 'text' },
    { id: 'tone', label: 'Tone', type: 'text' },
    { id: 'tags', label: 'Tags', type: 'multiselect' },
  ],
}

describe('batchRunner builders', () => {
  it('parses pasted lines trimming blanks', () => {
    expect(parsePastedLines('a\n\n  b  \n')).toEqual(['a', 'b'])
  })

  it('parses quoted commas and escaped quotes', () => {
    const parsed = parseCSV('"Doe, Jane",Engineer\n"Say ""hi""",ok')
    expect(parsed.rows).toEqual([
      ['Doe, Jane', 'Engineer'],
      ['Say "hi"', 'ok'],
    ])
  })

  it('drops fully blank rows', () => {
    expect(parseCSV('a\n   \nb').rows).toEqual([['a'], ['b']])
  })

  it('substitutes the batch field while keeping fixed inputs', () => {
    const message = buildBatchUserMessage(
      agent,
      { tone: 'formal', tags: ['x', 'y'] },
      'topic',
      'AI testing'
    )
    expect(message).toContain('Topic: AI testing')
    expect(message).toContain('Tone: formal')
    expect(message).toContain('Tags: x, y')
  })

  it('skips empty fixed values', () => {
    const message = buildBatchUserMessage(agent, { tone: '', tags: [] }, 'topic', 'T')
    expect(message).not.toContain('Tone:')
    expect(message).toContain('Topic: T')
  })
})
