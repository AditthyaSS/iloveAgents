import { describe, it, expect } from 'vitest'
import { createTrace, recordStep, finalizeTrace } from './executionTrace'

describe('executionTrace — mutation behavior', () => {
  describe('recordStep mutates the trace in place', () => {
    it('trace steps length increases after recordStep', () => {
      const trace = createTrace()
      expect(trace.steps).toHaveLength(0)
      recordStep(trace, { stepName: 'S', stepType: 'agent', input: 'i', output: 'o', durationMs: 100, status: 'done' })
      expect(trace.steps).toHaveLength(1)
    })

    it('trace object reference is the same before and after recordStep', () => {
      const trace = createTrace()
      const ref = trace
      recordStep(trace, { stepName: 'S', stepType: 'agent', input: 'i', output: 'o', durationMs: 100, status: 'done' })
      expect(trace).toBe(ref)
    })
  })

  describe('finalizeTrace mutates the trace in place', () => {
    it('trace status changes after finalizeTrace', () => {
      const trace = createTrace()
      expect(trace.status).toBe('running')
      finalizeTrace(trace, { status: 'done' })
      expect(trace.status).toBe('done')
    })

    it('trace endedAt changes after finalizeTrace', () => {
      const trace = createTrace()
      expect(trace.endedAt).toBeNull()
      finalizeTrace(trace, { status: 'done' })
      expect(trace.endedAt).not.toBeNull()
    })

    it('trace object reference is the same after finalizeTrace', () => {
      const trace = createTrace()
      const ref = trace
      finalizeTrace(trace, { status: 'done' })
      expect(trace).toBe(ref)
    })
  })
})
