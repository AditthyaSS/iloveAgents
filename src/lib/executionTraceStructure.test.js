import { describe, it, expect } from 'vitest'
import { createTrace, recordStep, finalizeTrace } from './executionTrace'

describe('executionTrace — data structure contracts', () => {
  describe('createTrace output structure', () => {
    it('has all required top-level keys', () => {
      const trace = createTrace()
      const requiredKeys = ['runId', 'workflowId', 'workflowTitle', 'startedAt', 'endedAt', 'steps', 'finalOutput', 'status']
      for (const key of requiredKeys) {
        expect(trace).toHaveProperty(key)
      }
    })

    it('steps is always an array', () => {
      expect(Array.isArray(createTrace().steps)).toBe(true)
    })

    it('status is one of known values initially', () => {
      expect(['running', 'done', 'failed']).toContain(createTrace().status)
    })
  })

  describe('recordStep output structure', () => {
    it('step has all required keys', () => {
      const trace = createTrace()
      recordStep(trace, { stepName: 'S', stepType: 'agent', input: 'i', output: 'o', durationMs: 100, status: 'done' })
      const step = trace.steps[0]
      const requiredKeys = ['stepName', 'stepType', 'input', 'output', 'durationMs', 'status', 'error']
      for (const key of requiredKeys) {
        expect(step).toHaveProperty(key)
      }
    })

    it('durationMs is always a number', () => {
      const trace = createTrace()
      recordStep(trace, { stepName: 'S', stepType: 'agent', input: 'i', output: 'o', durationMs: 100.7, status: 'done' })
      expect(typeof trace.steps[0].durationMs).toBe('number')
    })
  })

  describe('finalizeTrace output structure', () => {
    it('status is set to done or failed after finalize', () => {
      const t1 = createTrace()
      finalizeTrace(t1, { status: 'done' })
      expect(['done', 'failed']).toContain(t1.status)
    })

    it('endedAt is a string after finalize', () => {
      const trace = createTrace()
      finalizeTrace(trace, { status: 'done' })
      expect(typeof trace.endedAt).toBe('string')
    })
  })
})
