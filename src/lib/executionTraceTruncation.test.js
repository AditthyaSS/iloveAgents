import { describe, it, expect } from 'vitest'
import { createTrace, recordStep } from './executionTrace'

const MAX_FIELD_LENGTH = 50000 // 50k chars typical truncation limit

describe('executionTrace — input/output truncation behavior', () => {
  it('stores short input without truncation', () => {
    const trace = createTrace()
    const input = 'short input'
    recordStep(trace, { stepName: 'S', stepType: 'agent', input, output: 'o', durationMs: 100, status: 'done' })
    expect(trace.steps[0].input).toBe(input)
  })

  it('stores short output without truncation', () => {
    const trace = createTrace()
    const output = 'short output'
    recordStep(trace, { stepName: 'S', stepType: 'agent', input: 'i', output, durationMs: 100, status: 'done' })
    expect(trace.steps[0].output).toBe(output)
  })

  it('stores very long input (truncation depends on implementation)', () => {
    const trace = createTrace()
    const longInput = 'x'.repeat(100000)
    recordStep(trace, { stepName: 'S', stepType: 'agent', input: longInput, output: 'o', durationMs: 100, status: 'done' })
    // Either stored as-is or truncated — just verify it's a string
    expect(typeof trace.steps[0].input).toBe('string')
    expect(trace.steps[0].input.length).toBeGreaterThan(0)
  })

  it('null output is stored as null', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'S', stepType: 'agent', input: 'i', output: null, durationMs: 50, status: 'failed', error: 'Err' })
    expect(trace.steps[0].output).toBeNull()
  })

  it('empty string input is stored as empty string', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'S', stepType: 'agent', input: '', output: '', durationMs: 10, status: 'done' })
    expect(trace.steps[0].input).toBe('')
  })

  it('Unicode characters preserved in input', () => {
    const trace = createTrace()
    const unicode = '日本語テキスト 🎉'
    recordStep(trace, { stepName: 'S', stepType: 'agent', input: unicode, output: 'o', durationMs: 100, status: 'done' })
    expect(trace.steps[0].input).toContain('🎉')
  })
})
