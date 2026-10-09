import { describe, it, expect, beforeEach } from 'vitest'
import { createTrace, recordStep, finalizeTrace, loadTraces } from './executionTrace'

beforeEach(() => {
  localStorage.clear()
})

describe('executionTrace robustness', () => {
  it('ignores malformed steps and serializes object payloads', () => {
    const trace = createTrace({ workflowId: 'w' })
    recordStep(trace, null)
    recordStep(trace, { stepName: 's', input: { deep: [1, 2] }, output: { ok: true }, durationMs: NaN, status: 'done' })
    expect(trace.steps).toHaveLength(1)
    expect(trace.steps[0].input).toContain('deep')
    expect(trace.steps[0].durationMs).toBe(0)
  })

  it('finalizes idempotently without duplicating storage', () => {
    const trace = createTrace({ workflowId: 'w' })
    finalizeTrace(trace, { status: 'done', finalOutput: 'out' })
    finalizeTrace(trace, { status: 'done', finalOutput: 'out' })
    const stored = loadTraces().filter((t) => t.runId === trace.runId)
    expect(stored).toHaveLength(1)
  })
})
