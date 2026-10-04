import { describe, it, expect } from 'vitest'
import { createTrace, recordStep, finalizeTrace } from './executionTrace'

describe('executionTrace — status flow lifecycle', () => {
  it('trace starts in running status', () => {
    const trace = createTrace()
    expect(trace.status).toBe('running')
  })

  it('trace stays running after recording steps', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'S1', stepType: 'agent', input: 'i', output: 'o', durationMs: 100, status: 'done' })
    expect(trace.status).toBe('running')
  })

  it('trace becomes done after successful finalization', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done' })
    expect(trace.status).toBe('done')
  })

  it('trace becomes failed after failed finalization', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'failed' })
    expect(trace.status).toBe('failed')
  })

  it('endedAt is null before finalization', () => {
    const trace = createTrace()
    expect(trace.endedAt).toBeNull()
  })

  it('endedAt is set after finalization', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done' })
    expect(trace.endedAt).not.toBeNull()
  })

  it('finalOutput is null before finalization', () => {
    expect(createTrace().finalOutput).toBeNull()
  })

  it('finalOutput is set when provided at finalization', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done', finalOutput: 'The result' })
    expect(trace.finalOutput).toBe('The result')
  })

  it('full lifecycle: create → step → finalize → verify all fields', () => {
    const trace = createTrace({ workflowTitle: 'My Workflow' })
    recordStep(trace, { stepName: 'Gen', stepType: 'agent', input: 'prompt', output: 'result', durationMs: 300, status: 'done' })
    finalizeTrace(trace, { status: 'done', finalOutput: 'Final result' })

    expect(trace.status).toBe('done')
    expect(trace.steps.length).toBe(1)
    expect(trace.finalOutput).toBe('Final result')
    expect(trace.endedAt).not.toBeNull()
    expect(trace.workflowTitle).toBe('My Workflow')
  })
})
