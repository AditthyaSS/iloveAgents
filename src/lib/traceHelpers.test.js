import { describe, it, expect, beforeEach } from 'vitest'
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
  })

  it('creates running traces with ids', () => {
    const trace = createTrace({ workflowId: 'w1', workflowTitle: 'Flow' })
    expect(trace.status).toBe('running')
    expect(trace.runId).toMatch(/^run_/)
    expect(trace.steps).toEqual([])
  })

  it('truncates large payloads for storage', () => {
    const trace = createTrace({})
    recordStep(trace, {
      stepName: 's',
      stepType: 'agent',
      input: 'in',
      output: 'x'.repeat(9000),
      durationMs: 12.6,
      status: 'done',
    })
    expect(trace.steps[0].output).toMatch(/\.\.\. \[truncated\]$/)
    expect(trace.steps[0].durationMs).toBe(13)
  })

  it('finalizes and reloads traces', () => {
    const trace = createTrace({ workflowId: 'w1' })
    finalizeTrace(trace, { status: 'done', finalOutput: 'out' })
    expect(trace.status).toBe('done')
    expect(trace.endedAt).not.toBeNull()
    const loaded = loadTraces()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].runId).toBe(trace.runId)
    clearTraces()
    expect(loadTraces()).toEqual([])
  })

  it('tolerates corrupt storage', () => {
    localStorage.setItem('ila_execution_traces', 'not-json')
    expect(loadTraces()).toEqual([])
  })

  it('formats durations compactly', () => {
    expect(formatDuration(250)).toBe('250ms')
    expect(formatDuration(3200)).toBe('3.2s')
    expect(formatDuration(90000)).toBe('1m 30s')
    expect(formatDuration(-5)).toBe('0ms')
  })
})
