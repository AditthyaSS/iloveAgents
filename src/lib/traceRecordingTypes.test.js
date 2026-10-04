import { describe, it, expect } from 'vitest'
import { createTrace, recordStep } from './executionTrace'

describe('executionTrace — step type handling', () => {
  it('records stepType as "agent" by default', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'S', input: 'i', output: 'o', durationMs: 100, status: 'done' })
    expect(trace.steps[0].stepType).toBe('agent')
  })

  it('records custom stepType "tool"', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'T', stepType: 'tool', input: 'i', output: 'o', durationMs: 50, status: 'done' })
    expect(trace.steps[0].stepType).toBe('tool')
  })

  it('records custom stepType "pipeline"', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'P', stepType: 'pipeline', input: 'i', output: 'o', durationMs: 200, status: 'done' })
    expect(trace.steps[0].stepType).toBe('pipeline')
  })

  it('error field is null for done status', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'S', stepType: 'agent', input: 'i', output: 'o', durationMs: 100, status: 'done' })
    expect(trace.steps[0].error).toBeNull()
  })

  it('stores error message for failed step', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'S', stepType: 'agent', input: 'i', output: null, durationMs: 50, status: 'failed', error: 'Timeout after 30s' })
    expect(trace.steps[0].error).toBe('Timeout after 30s')
  })

  it('output can be null for failed steps', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'S', stepType: 'agent', input: 'i', output: null, durationMs: 50, status: 'failed', error: 'Error' })
    expect(trace.steps[0].output).toBeNull()
  })

  it('durationMs is stored as integer (rounded)', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'S', stepType: 'agent', input: 'i', output: 'o', durationMs: 1234.9, status: 'done' })
    expect(Number.isInteger(trace.steps[0].durationMs)).toBe(true)
    expect(trace.steps[0].durationMs).toBe(1235)
  })
})
