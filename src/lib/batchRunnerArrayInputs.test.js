import { describe, it, expect } from 'vitest'
import { buildBatchUserMessage } from './batchRunner'

const AGENT = {
  inputs: [
    { id: 'topics', label: 'Topics' },
    { id: 'context', label: 'Context' },
  ]
}

describe('buildBatchUserMessage — array values for inputs', () => {
  it('array value is joined with commas', () => {
    const msg = buildBatchUserMessage(AGENT, { topics: ['AI', 'ML', 'NLP'] }, 'context', 'research paper')
    expect(msg).toContain('Topics: AI, ML, NLP')
  })

  it('single-item array renders without trailing comma', () => {
    const msg = buildBatchUserMessage(AGENT, { topics: ['blockchain'] }, 'context', 'analysis')
    expect(msg).toContain('Topics: blockchain')
    expect(msg).not.toContain('Topics: blockchain,')
  })

  it('empty array is excluded from message', () => {
    const msg = buildBatchUserMessage(AGENT, { topics: [] }, 'context', 'test')
    expect(msg).not.toContain('Topics:')
  })

  it('batch field value always included when non-empty', () => {
    const msg = buildBatchUserMessage(AGENT, {}, 'context', 'override context')
    expect(msg).toContain('Context: override context')
  })
})
