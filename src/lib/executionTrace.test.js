
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createTrace,
  recordStep,
  finalizeTrace,
  loadTraces,
  clearTraces,
  formatDuration,
} from './executionTrace'

describe('executionTrace', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('creates a new trace with running status and no steps', () => {
    const trace = createTrace({
      workflowId: 'workflow-1',
      workflowTitle: 'Test workflow',
    })

    expect(trace.runId).toMatch(/^run_/)
    expect(trace.workflowId).toBe('workflow-1')
    expect(trace.workflowTitle).toBe('Test workflow')
    expect(trace.status).toBe('running')
    expect(trace.steps).toEqual([])
    expect(trace.endedAt).toBeNull()
  })

  it('records a step and rounds its duration', () => {
    const trace = createTrace()

    recordStep(trace, {
      stepName: 'Agent execution',
      stepType: 'agent',
      input: 'Hello',
      output: 'Hi there',
      durationMs: 123.7,
      status: 'done',
    })

    expect(trace.steps).toHaveLength(1)
    expect(trace.steps[0].stepName).toBe('Agent execution')
    expect(trace.steps[0].input).toBe('Hello')
    expect(trace.steps[0].output).toBe('Hi there')
    expect(trace.steps[0].durationMs).toBe(124)
    expect(trace.steps[0].status).toBe('success')
    expect(trace.steps[0].error).toBeNull()
  })

  it('finalizes and persists a trace', () => {
    const trace = createTrace()

    finalizeTrace(trace, {
      status: 'done',
      finalOutput: 'Completed successfully',
    })

    expect(trace.status).toBe('success')
    expect(trace.endedAt).not.toBeNull()
    expect(trace.finalOutput).toBe('Completed successfully')
    expect(loadTraces()[0].runId).toBe(trace.runId)
  })

  it('clears stored traces', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done' })

    clearTraces()

    expect(loadTraces()).toEqual([])
  })

  it('formats durations correctly', () => {
    expect(formatDuration(250)).toBe('250ms')
    expect(formatDuration(1500)).toBe('1.5s')
    expect(formatDuration(61000)).toBe('1m 1s')
    expect(formatDuration(-1)).toBe('0ms')
  })
})
