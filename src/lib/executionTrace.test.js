import { describe, it, expect } from 'vitest'
import { createTrace, recordStep, finalizeTrace, formatDuration } from './executionTrace'

describe('createTrace', () => {
  it('returns a trace with running status', () => {
    const trace = createTrace({ workflowTitle: 'My Workflow' })
    expect(trace.status).toBe('running')
  })

  it('generates a unique runId starting with run_', () => {
    const trace = createTrace()
    expect(trace.runId).toMatch(/^run_\d+_[a-z0-9]+$/)
  })

  it('two traces have different runIds', () => {
    const a = createTrace()
    const b = createTrace()
    expect(a.runId).not.toBe(b.runId)
  })

  it('starts with empty steps array', () => {
    const trace = createTrace()
    expect(trace.steps).toEqual([])
  })

  it('stores workflowTitle', () => {
    const trace = createTrace({ workflowTitle: 'Test Workflow' })
    expect(trace.workflowTitle).toBe('Test Workflow')
  })

  it('stores workflowId when provided', () => {
    const trace = createTrace({ workflowId: 'wf-001', workflowTitle: 'Test' })
    expect(trace.workflowId).toBe('wf-001')
  })

  it('endedAt starts as null', () => {
    const trace = createTrace()
    expect(trace.endedAt).toBeNull()
  })

  it('startedAt is a valid ISO string', () => {
    const trace = createTrace()
    expect(() => new Date(trace.startedAt)).not.toThrow()
    expect(trace.startedAt).toContain('Z')
  })
})

describe('recordStep', () => {
  it('appends a step to the trace', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'Summarizer', stepType: 'agent', input: 'Hello', output: 'Hi', durationMs: 500, status: 'done' })
    expect(trace.steps).toHaveLength(1)
  })

  it('stores the step name', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'Classifier', stepType: 'agent', input: 'text', output: 'result', durationMs: 200, status: 'done' })
    expect(trace.steps[0].stepName).toBe('Classifier')
  })

  it('rounds durationMs', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'S', stepType: 'agent', input: 'i', output: 'o', durationMs: 123.7, status: 'done' })
    expect(trace.steps[0].durationMs).toBe(124)
  })

  it('returns the trace for chaining', () => {
    const trace = createTrace()
    const returned = recordStep(trace, { stepName: 'S', stepType: 'agent', input: 'i', output: 'o', durationMs: 100, status: 'done' })
    expect(returned).toBe(trace)
  })
})

describe('finalizeTrace', () => {
  it('sets status to done', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done', finalOutput: 'result' })
    expect(trace.status).toBe('done')
  })

  it('sets endedAt to an ISO string', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done' })
    expect(trace.endedAt).not.toBeNull()
    expect(() => new Date(trace.endedAt)).not.toThrow()
  })

  it('stores finalOutput', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done', finalOutput: 'The answer is 42' })
    expect(trace.finalOutput).toContain('42')
  })

  it('returns the trace for chaining', () => {
    const trace = createTrace()
    expect(finalizeTrace(trace, { status: 'done' })).toBe(trace)
  })
})

describe('formatDuration', () => {
  it('formats milliseconds under 1s', () => {
    expect(formatDuration(500)).toBe('500ms')
  })

  it('formats exactly 1000ms as 1.0s', () => {
    expect(formatDuration(1000)).toBe('1.0s')
  })

  it('formats seconds between 1s and 1min', () => {
    expect(formatDuration(5500)).toBe('5.5s')
  })

  it('formats 1 minute as 1m 0s', () => {
    expect(formatDuration(60000)).toBe('1m 0s')
  })

  it('formats 90 seconds as 1m 30s', () => {
    expect(formatDuration(90000)).toBe('1m 30s')
  })

  it('returns 0ms for negative input', () => {
    expect(formatDuration(-100)).toBe('0ms')
  })

  it('returns 0ms for Infinity', () => {
    expect(formatDuration(Infinity)).toBe('0ms')
  })

  it('returns 0ms for NaN', () => {
    expect(formatDuration(NaN)).toBe('0ms')
  })
})
