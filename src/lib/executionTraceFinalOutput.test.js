import { describe, it, expect } from 'vitest'
import { createTrace, finalizeTrace, formatDuration } from './executionTrace'

describe('executionTrace — finalOutput handling', () => {
  it('finalOutput is null before finalization', () => {
    expect(createTrace().finalOutput).toBeNull()
  })

  it('finalOutput is set when provided', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done', finalOutput: 'Great result' })
    expect(trace.finalOutput).toBe('Great result')
  })

  it('finalOutput is null when not provided (default)', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done' })
    expect(trace.finalOutput).toBeNull()
  })

  it('finalOutput can be a long string', () => {
    const trace = createTrace()
    const longOutput = 'x'.repeat(5000)
    finalizeTrace(trace, { status: 'done', finalOutput: longOutput })
    expect(trace.finalOutput).toHaveLength(5000)
  })

  it('finalOutput can be an empty string', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done', finalOutput: '' })
    expect(trace.finalOutput).toBe('')
  })

  it('formatDuration works on typical AI response times', () => {
    expect(formatDuration(350)).toBe('350ms')
    expect(formatDuration(1200)).toBe('1.2s')
    expect(formatDuration(8500)).toBe('8.5s')
    expect(formatDuration(45000)).toBe('45.0s')
    expect(formatDuration(75000)).toBe('1m 15s')
  })
})
