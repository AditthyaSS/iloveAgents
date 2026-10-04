import { describe, it, expect } from 'vitest'
import { parsePastedLines, parseCSV, buildBatchUserMessage } from './batchRunner'

const AGENT = {
  inputs: [
    { id: 'task', label: 'Task' },
    { id: 'format', label: 'Format' }
  ]
}

describe('batchRunner — concurrent call safety', () => {
  it('parsePastedLines called concurrently returns independent results', () => {
    const inputs = ['a\nb\nc', 'x\ny', '1\n2\n3\n4']
    const results = inputs.map(parsePastedLines)
    expect(results[0]).toHaveLength(3)
    expect(results[1]).toHaveLength(2)
    expect(results[2]).toHaveLength(4)
  })

  it('parseCSV called concurrently returns independent results', () => {
    const csvs = ['a,b\n1,2', 'x\ny\nz', 'p,q,r\n1,2,3\n4,5,6']
    const results = csvs.map(parseCSV)
    expect(results[0].rows).toHaveLength(2)
    expect(results[1].rows).toHaveLength(3)
    expect(results[2].rows).toHaveLength(3)
  })

  it('buildBatchUserMessage with different agents produces different results', () => {
    const agent1 = { inputs: [{ id: 'topic', label: 'Topic' }] }
    const agent2 = { inputs: [{ id: 'query', label: 'Query' }] }
    const msg1 = buildBatchUserMessage(agent1, {}, 'topic', 'AI')
    const msg2 = buildBatchUserMessage(agent2, {}, 'query', 'AI')
    expect(msg1).toContain('Topic: AI')
    expect(msg2).toContain('Query: AI')
    expect(msg1).not.toBe(msg2)
  })
})
