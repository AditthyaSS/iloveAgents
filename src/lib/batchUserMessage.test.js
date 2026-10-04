import { describe, it, expect } from 'vitest'
import { buildBatchUserMessage } from './batchRunner'

const agent = {
  inputs: [
    { id: 'topic',    label: 'Topic' },
    { id: 'audience', label: 'Audience' },
    { id: 'tone',     label: 'Tone' },
  ],
}

describe('buildBatchUserMessage', () => {
  it('builds message from fixed inputs + batch item value', () => {
    const result = buildBatchUserMessage(
      agent,
      { audience: 'Developers', tone: 'Professional' },
      'topic',
      'AI tools'
    )
    expect(result).toContain('Topic: AI tools')
    expect(result).toContain('Audience: Developers')
    expect(result).toContain('Tone: Professional')
  })

  it('skips empty fixed input values', () => {
    const result = buildBatchUserMessage(
      agent,
      { audience: '', tone: 'Casual' },
      'topic',
      'testing'
    )
    expect(result).not.toContain('Audience:')
    expect(result).toContain('Tone: Casual')
  })

  it('skips null fixed input values', () => {
    const result = buildBatchUserMessage(
      agent,
      { audience: null, tone: 'Formal' },
      'topic',
      'item'
    )
    expect(result).not.toContain('Audience:')
  })

  it('uses batch item value for the batchFieldId', () => {
    const result = buildBatchUserMessage(
      agent,
      { topic: 'ignored', audience: 'Everyone', tone: 'Fun' },
      'topic',
      'Override Topic'
    )
    expect(result).toContain('Topic: Override Topic')
    expect(result).not.toContain('Topic: ignored')
  })

  it('handles array fixed input by joining with comma', () => {
    const result = buildBatchUserMessage(
      agent,
      { audience: ['Devs', 'Designers'], tone: 'Clear' },
      'topic',
      'item'
    )
    expect(result).toContain('Audience: Devs, Designers')
  })

  it('trims whitespace from string values', () => {
    const result = buildBatchUserMessage(
      agent,
      { audience: '  Developers  ', tone: 'Direct' },
      'topic',
      'test'
    )
    expect(result).toContain('Audience: Developers')
    expect(result).not.toContain('Audience:   Developers  ')
  })

  it('returns empty string when all inputs are empty', () => {
    const result = buildBatchUserMessage(
      agent,
      { audience: '', tone: '' },
      'topic',
      ''
    )
    expect(result.trim()).toBe('')
  })
})
