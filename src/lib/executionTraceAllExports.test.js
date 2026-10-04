import { describe, it, expect } from 'vitest'
import { createTrace, recordStep, finalizeTrace, loadTraces, clearTraces, formatDuration } from './executionTrace'

describe('executionTrace — all exports present and callable', () => {
  it('createTrace is a function', () => expect(typeof createTrace).toBe('function'))
  it('recordStep is a function', () => expect(typeof recordStep).toBe('function'))
  it('finalizeTrace is a function', () => expect(typeof finalizeTrace).toBe('function'))
  it('loadTraces is a function', () => expect(typeof loadTraces).toBe('function'))
  it('clearTraces is a function', () => expect(typeof clearTraces).toBe('function'))
  it('formatDuration is a function', () => expect(typeof formatDuration).toBe('function'))
})

describe('executionTrace — return type guarantees', () => {
  it('createTrace returns an object', () => {
    expect(typeof createTrace()).toBe('object')
    expect(createTrace()).not.toBeNull()
  })

  it('recordStep returns the trace object (chainable)', () => {
    const trace = createTrace()
    const result = recordStep(trace, { stepName: 'S', stepType: 'agent', input: 'i', output: 'o', durationMs: 100, status: 'done' })
    expect(result).toBe(trace)
  })

  it('finalizeTrace returns the trace object (chainable)', () => {
    const trace = createTrace()
    const result = finalizeTrace(trace, { status: 'done' })
    expect(result).toBe(trace)
  })

  it('formatDuration always returns a non-empty string', () => {
    const cases = [0, 1, 500, 1000, 60000, -1, NaN]
    cases.forEach((v) => {
      const result = formatDuration(v)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })
})
