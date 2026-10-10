import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  createTrace,
  recordStep,
  finalizeTrace,
  loadTraces,
  clearTraces,
  formatDuration,
} from './executionTrace.js'

// Minimal localStorage mock
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
  }
})()

beforeEach(() => {
  globalThis.localStorage = localStorageMock
  localStorageMock.clear()
})

afterEach(() => {
  localStorageMock.clear()
})

describe('createTrace', () => {
  it('returns an object with a unique runId', () => {
    const t1 = createTrace()
    const t2 = createTrace()
    expect(t1.runId).toBeTruthy()
    expect(t1.runId).not.toBe(t2.runId)
  })

  it('sets status to "running"', () => {
    const trace = createTrace()
    expect(trace.status).toBe('running')
  })

  it('initializes steps as empty array', () => {
    const trace = createTrace()
    expect(trace.steps).toEqual([])
  })

  it('stores the provided workflowId and workflowTitle', () => {
    const trace = createTrace({ workflowId: 'wf-1', workflowTitle: 'My Flow' })
    expect(trace.workflowId).toBe('wf-1')
    expect(trace.workflowTitle).toBe('My Flow')
  })

  it('defaults workflowId to null when omitted', () => {
    const trace = createTrace()
    expect(trace.workflowId).toBeNull()
  })

  it('sets startedAt to an ISO date string', () => {
    const trace = createTrace()
    expect(() => new Date(trace.startedAt)).not.toThrow()
    expect(new Date(trace.startedAt).toISOString()).toBe(trace.startedAt)
  })
})

describe('recordStep', () => {
  it('appends a step to the trace', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'Step 1', stepType: 'agent', input: 'hello', output: 'world', durationMs: 100, status: 'done' })
    expect(trace.steps).toHaveLength(1)
    expect(trace.steps[0].stepName).toBe('Step 1')
  })

  it('returns the same trace object (mutation)', () => {
    const trace = createTrace()
    const result = recordStep(trace, { stepName: 'S', stepType: 'agent', input: '', output: '', durationMs: 0, status: 'done' })
    expect(result).toBe(trace)
  })

  it('defaults stepType to "agent" when omitted', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'S', input: '', output: '', durationMs: 0, status: 'done' })
    expect(trace.steps[0].stepType).toBe('agent')
  })

  it('rounds durationMs to integer', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'S', stepType: 'agent', input: '', output: '', durationMs: 123.7, status: 'done' })
    expect(Number.isInteger(trace.steps[0].durationMs)).toBe(true)
  })

  it('stores null for error when not provided', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'S', stepType: 'agent', input: '', output: '', durationMs: 0, status: 'done' })
    expect(trace.steps[0].error).toBeNull()
  })

  it('truncates very long input and output', () => {
    const trace = createTrace()
    const longString = 'x'.repeat(10000)
    recordStep(trace, { stepName: 'S', stepType: 'agent', input: longString, output: longString, durationMs: 0, status: 'done' })
    expect(trace.steps[0].input.length).toBeLessThan(10000)
    expect(trace.steps[0].output.length).toBeLessThan(10000)
  })
})

describe('finalizeTrace', () => {
  it('sets status on the trace', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done' })
    expect(trace.status).toBe('done')
  })

  it('sets endedAt to an ISO date string', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done' })
    expect(new Date(trace.endedAt).toISOString()).toBe(trace.endedAt)
  })

  it('stores the finalOutput on the trace', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done', finalOutput: 'The answer' })
    expect(trace.finalOutput).toBe('The answer')
  })

  it('defaults finalOutput to null when omitted', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'failed' })
    expect(trace.finalOutput).toBeNull()
  })

  it('persists the trace to localStorage', () => {
    const trace = createTrace({ workflowTitle: 'Persist Test' })
    finalizeTrace(trace, { status: 'done' })
    const stored = loadTraces()
    expect(stored.length).toBeGreaterThanOrEqual(1)
    expect(stored[0].workflowTitle).toBe('Persist Test')
  })
})

describe('loadTraces', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(loadTraces()).toEqual([])
  })

  it('returns an empty array for malformed JSON', () => {
    localStorage.setItem('ila_execution_traces', 'not-json')
    expect(loadTraces()).toEqual([])
  })

  it('returns an empty array when stored value is not an array', () => {
    localStorage.setItem('ila_execution_traces', JSON.stringify({ a: 1 }))
    expect(loadTraces()).toEqual([])
  })

  it('returns stored traces in insertion order (newest first after finalize)', () => {
    const t1 = createTrace({ workflowTitle: 'First' })
    finalizeTrace(t1, { status: 'done' })
    const t2 = createTrace({ workflowTitle: 'Second' })
    finalizeTrace(t2, { status: 'done' })
    const stored = loadTraces()
    expect(stored[0].workflowTitle).toBe('Second')
  })
})

describe('clearTraces', () => {
  it('removes all stored traces', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done' })
    expect(loadTraces().length).toBeGreaterThan(0)
    clearTraces()
    expect(loadTraces()).toEqual([])
  })
})

describe('formatDuration', () => {
  it('formats sub-second durations as ms', () => {
    expect(formatDuration(250)).toBe('250ms')
    expect(formatDuration(0)).toBe('0ms')
  })

  it('formats second-range durations with one decimal', () => {
    expect(formatDuration(1500)).toBe('1.5s')
    expect(formatDuration(59999)).toBe('60.0s')
  })

  it('formats minute-range durations as Xm Ys', () => {
    expect(formatDuration(90000)).toBe('1m 30s')
    expect(formatDuration(125000)).toBe('2m 5s')
  })

  it('returns "0ms" for negative durations', () => {
    expect(formatDuration(-1)).toBe('0ms')
  })

  it('returns "0ms" for NaN or non-finite values', () => {
    expect(formatDuration(NaN)).toBe('0ms')
    expect(formatDuration(Infinity)).toBe('0ms')
    expect(formatDuration()).toBe('0ms')
  })
})
