import { describe, it, expect } from 'vitest'
import { createTrace, recordStep, finalizeTrace } from './executionTrace'

describe('executionTrace — multiple independent traces', () => {
  it('5 concurrent traces have unique runIds', () => {
    const traces = Array.from({ length: 5 }, () => createTrace())
    const runIds = new Set(traces.map((t) => t.runId))
    expect(runIds.size).toBe(5)
  })

  it('steps in one trace do not affect another trace', () => {
    const t1 = createTrace()
    const t2 = createTrace()
    recordStep(t1, { stepName: 'T1-Step1', stepType: 'agent', input: 'i', output: 'o', durationMs: 100, status: 'done' })
    expect(t2.steps).toHaveLength(0)
  })

  it('finalizing one trace does not affect another', () => {
    const t1 = createTrace()
    const t2 = createTrace()
    finalizeTrace(t1, { status: 'done' })
    expect(t2.status).toBe('running')
    expect(t2.endedAt).toBeNull()
  })

  it('separate workflowTitles are preserved independently', () => {
    const t1 = createTrace({ workflowTitle: 'Pipeline A' })
    const t2 = createTrace({ workflowTitle: 'Pipeline B' })
    expect(t1.workflowTitle).toBe('Pipeline A')
    expect(t2.workflowTitle).toBe('Pipeline B')
  })

  it('different step counts per trace', () => {
    const t1 = createTrace()
    const t2 = createTrace()
    recordStep(t1, { stepName: 'S1', stepType: 'agent', input: 'i', output: 'o', durationMs: 100, status: 'done' })
    recordStep(t1, { stepName: 'S2', stepType: 'agent', input: 'i', output: 'o', durationMs: 100, status: 'done' })
    recordStep(t2, { stepName: 'S1', stepType: 'agent', input: 'i', output: 'o', durationMs: 100, status: 'done' })
    expect(t1.steps).toHaveLength(2)
    expect(t2.steps).toHaveLength(1)
  })
})
