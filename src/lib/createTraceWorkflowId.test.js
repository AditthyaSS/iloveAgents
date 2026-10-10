import { describe, it, expect } from 'vitest'
import { createTrace, recordStep, finalizeTrace } from './executionTrace'

describe('createTrace — workflowId and title handling', () => {
  it('stores workflowId when provided', () => {
    const trace = createTrace({ workflowId: 'wf-abc-123', workflowTitle: 'Test' })
    expect(trace.workflowId).toBe('wf-abc-123')
  })

  it('workflowId is null when not provided', () => {
    expect(createTrace({ workflowTitle: 'Test' }).workflowId).toBeNull()
  })

  it('stores workflowTitle when provided', () => {
    expect(createTrace({ workflowTitle: 'My Pipeline' }).workflowTitle).toBe('My Pipeline')
  })

  it('workflowTitle is empty string when not provided', () => {
    expect(createTrace().workflowTitle).toBe('')
  })

  it('workflowId is preserved through recordStep and finalizeTrace', () => {
    const trace = createTrace({ workflowId: 'wf-999', workflowTitle: 'Keep ID' })
    recordStep(trace, { stepName: 'S', stepType: 'agent', input: 'i', output: 'o', durationMs: 100, status: 'done' })
    finalizeTrace(trace, { status: 'done' })
    expect(trace.workflowId).toBe('wf-999')
    expect(trace.workflowTitle).toBe('Keep ID')
  })

  it('multiple traces have independent workflowIds', () => {
    const t1 = createTrace({ workflowId: 'wf-1' })
    const t2 = createTrace({ workflowId: 'wf-2' })
    expect(t1.workflowId).toBe('wf-1')
    expect(t2.workflowId).toBe('wf-2')
    expect(t1.workflowId).not.toBe(t2.workflowId)
  })
})
