import { describe, it, expect } from 'vitest'
import { buildBatchUserMessage } from './batchRunner'

const agent = {
  inputs: [
    { id: 'prompt', label: 'Prompt' },
    { id: 'context', label: 'Context' },
    { id: 'format', label: 'Format' },
  ],
}

describe('buildBatchUserMessage — output formatting', () => {
  it('separates fields with double newline', () => {
    const result = buildBatchUserMessage(
      agent,
      { context: 'Some context', format: 'JSON' },
      'prompt',
      'Summarize this'
    )
    // Should have two newlines between each field pair
    expect(result).toContain('\n\n')
  })

  it('trims leading/trailing whitespace from result', () => {
    const result = buildBatchUserMessage(
      agent,
      { context: 'ctx' },
      'prompt',
      'test'
    )
    expect(result).toBe(result.trim())
  })

  it('does not have triple+ newlines', () => {
    const result = buildBatchUserMessage(
      agent,
      { context: 'ctx', format: 'txt' },
      'prompt',
      'test'
    )
    expect(result).not.toMatch(/\n{3,}/)
  })

  it('single field produces no extra newlines', () => {
    const singleInputAgent = { inputs: [{ id: 'prompt', label: 'Prompt' }] }
    const result = buildBatchUserMessage(singleInputAgent, {}, 'prompt', 'hello')
    expect(result).toBe('Prompt: hello')
  })

  it('uses colon-space format for each field', () => {
    const result = buildBatchUserMessage(
      agent,
      { context: 'background info' },
      'prompt',
      'my task'
    )
    expect(result).toContain('Prompt: my task')
    expect(result).toContain('Context: background info')
  })

  it('handles very long item value without truncation', () => {
    const longValue = 'word '.repeat(100).trim()
    const result = buildBatchUserMessage(agent, {}, 'prompt', longValue)
    expect(result).toContain(longValue)
  })
})
