import { describe, it, expect } from 'vitest'
import { createTrace, recordStep, finalizeTrace } from './executionTrace'

describe('createTrace — extended edge cases', () => {
  it('handles default parameters (no args)', () => {
    const trace = createTrace()
    expect(trace.workflowId).toBeNull()
    expect(trace.workflowTitle).toBe('')
  })

  it('runId format: run_<timestamp>_<random>', () => {
    const trace = createTrace()
    const parts = trace.runId.split('_')
    expect(parts[0]).toBe('run')
    expect(parts.length).toBeGreaterThanOrEqual(3)
  })

  it('startedAt is close to current time', () => {
    const before = new Date().toISOString()
    const trace = createTrace()
    const after = new Date().toISOString()
    expect(trace.startedAt >= before).toBe(true)
    expect(trace.startedAt <= after).toBe(true)
  })

  it('finalOutput starts as null', () => {
    expect(createTrace().finalOutput).toBeNull()
  })
})

describe('recordStep — comprehensive step recording', () => {
  it('records multiple steps in order', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'Step 1', stepType: 'agent', input: 'a', output: 'x', durationMs: 100, status: 'done' })
    recordStep(trace, { stepName: 'Step 2', stepType: 'agent', input: 'b', output: 'y', durationMs: 200, status: 'done' })
    expect(trace.steps[0].stepName).toBe('Step 1')
    expect(trace.steps[1].stepName).toBe('Step 2')
  })

  it('records error field for failed steps', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'Fail', stepType: 'agent', input: 'x', output: null, durationMs: 50, status: 'failed', error: 'Rate limit exceeded' })
    expect(trace.steps[0].error).toBe('Rate limit exceeded')
    expect(trace.steps[0].status).toBe('failed')
  })

  it('defaults error to null for done steps', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'OK', stepType: 'agent', input: 'in', output: 'out', durationMs: 100, status: 'done' })
    expect(trace.steps[0].error).toBeNull()
  })

  it('defaults stepType to agent when not provided', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'S', input: 'i', output: 'o', durationMs: 10, status: 'done' })
    expect(trace.steps[0].stepType).toBe('agent')
  })
})

describe('finalizeTrace — comprehensive finalization', () => {
  it('sets status to failed', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'failed', finalOutput: null })
    expect(trace.status).toBe('failed')
  })

  it('finalOutput defaults to null when not provided', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done' })
    expect(trace.finalOutput).toBeNull()
  })

  it('endedAt is after startedAt', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done' })
    expect(trace.endedAt! >= trace.startedAt).toBe(true)
  })
})
