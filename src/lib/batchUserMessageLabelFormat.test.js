import { describe, it, expect } from 'vitest'
import { buildBatchUserMessage } from './batchRunner'

describe('buildBatchUserMessage — label format details', () => {
  const agent = {
    inputs: [
      { id: 'topic', label: 'Topic' },
      { id: 'tone', label: 'Writing Tone' },
      { id: 'length', label: 'Word Count' },
    ]
  }

  it('uses "Label: value" format with colon and space', () => {
    const msg = buildBatchUserMessage(agent, { tone: 'formal' }, 'topic', 'AI Ethics')
    expect(msg).toContain('Topic: AI Ethics')
    expect(msg).toContain('Writing Tone: formal')
  })

  it('multi-word label is preserved exactly', () => {
    const msg = buildBatchUserMessage(agent, { 'length': '500' }, 'topic', 'test')
    expect(msg).toContain('Word Count: 500')
  })

  it('batch field uses its own label', () => {
    const msg = buildBatchUserMessage(agent, {}, 'topic', 'Machine Learning')
    expect(msg).toContain('Topic: Machine Learning')
  })

  it('only includes fields with non-empty values', () => {
    const msg = buildBatchUserMessage(agent, { tone: '', length: '300' }, 'topic', 'test')
    expect(msg).not.toContain('Writing Tone:')
    expect(msg).toContain('Word Count: 300')
  })

  it('fields are separated by double newlines', () => {
    const msg = buildBatchUserMessage(agent, { tone: 'casual', length: '250' }, 'topic', 'Travel')
    const sections = msg.split('\n\n').filter((s) => s.trim())
    expect(sections.length).toBeGreaterThanOrEqual(2)
  })
})
