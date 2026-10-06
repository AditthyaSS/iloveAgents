import { describe, it, expect } from 'vitest'
import { buildBatchUserMessage } from './batchRunner.js'

const makeAgent = (inputs) => ({ inputs })

describe('buildBatchUserMessage', () => {
  it('builds a message with the batch field substituted', () => {
    const agent = makeAgent([
      { id: 'topic', label: 'Topic' },
      { id: 'tone', label: 'Tone' },
    ])
    const result = buildBatchUserMessage(agent, { tone: 'formal' }, 'topic', 'AI agents')
    expect(result).toContain('Topic: AI agents')
    expect(result).toContain('Tone: formal')
  })

  it('skips empty fixed inputs', () => {
    const agent = makeAgent([
      { id: 'topic', label: 'Topic' },
      { id: 'empty', label: 'Empty' },
    ])
    const result = buildBatchUserMessage(agent, { empty: '' }, 'topic', 'hello')
    expect(result).not.toContain('Empty')
    expect(result).toContain('Topic: hello')
  })

  it('skips null and undefined fixed inputs', () => {
    const agent = makeAgent([
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ])
    const result = buildBatchUserMessage(agent, { a: null, b: undefined }, 'a', 'value')
    // null skipped, undefined skipped; only batch field appears
    expect(result).toContain('A: value')
    expect(result).not.toContain('B:')
  })

  it('skips empty array inputs', () => {
    const agent = makeAgent([
      { id: 'tags', label: 'Tags' },
      { id: 'text', label: 'Text' },
    ])
    const result = buildBatchUserMessage(agent, { tags: [], text: 'hello' }, 'text', 'world')
    expect(result).not.toContain('Tags')
    expect(result).toContain('Text: world')
  })

  it('formats array values as comma-separated', () => {
    const agent = makeAgent([
      { id: 'keywords', label: 'Keywords' },
    ])
    const result = buildBatchUserMessage(agent, {}, 'keywords', ['SEO', 'content', 'marketing'])
    expect(result).toBe('Keywords: SEO, content, marketing')
  })

  it('trims whitespace from string values', () => {
    const agent = makeAgent([{ id: 'topic', label: 'Topic' }])
    const result = buildBatchUserMessage(agent, {}, 'topic', '  hello world  ')
    expect(result).toBe('Topic: hello world')
  })

  it('separates parts with double newlines', () => {
    const agent = makeAgent([
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ])
    const result = buildBatchUserMessage(agent, { b: 'second' }, 'a', 'first')
    expect(result).toBe('A: first\n\nB: second')
  })

  it('returns empty string when all inputs are empty', () => {
    const agent = makeAgent([
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ])
    const result = buildBatchUserMessage(agent, { a: '', b: '' }, 'a', '')
    expect(result).toBe('')
  })

  it('handles whitespace-only string batch item as empty', () => {
    const agent = makeAgent([{ id: 'topic', label: 'Topic' }])
    const result = buildBatchUserMessage(agent, {}, 'topic', '   ')
    expect(result).toBe('')
  })

  it('collapses 3+ consecutive newlines to 2', () => {
    const agent = makeAgent([
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ])
    // Even if somehow 3 newlines crept in, they get collapsed
    const result = buildBatchUserMessage(agent, { b: 'val' }, 'a', 'val')
    expect(result).not.toMatch(/\n{3,}/)
  })

  it('uses the batch field value even when fixed inputs also have it', () => {
    const agent = makeAgent([
      { id: 'item', label: 'Item' },
    ])
    // fixedInputs has 'item' but itemValue should override it
    const result = buildBatchUserMessage(agent, { item: 'fixed' }, 'item', 'from-batch')
    expect(result).toContain('from-batch')
    expect(result).not.toContain('fixed')
  })

  it('preserves non-string (numeric) batch values', () => {
    const agent = makeAgent([{ id: 'count', label: 'Count' }])
    const result = buildBatchUserMessage(agent, {}, 'count', 42)
    expect(result).toBe('Count: 42')
  })
})
