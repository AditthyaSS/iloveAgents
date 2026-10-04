import { describe, it, expect } from 'vitest'
import { createTrace, recordStep, finalizeTrace } from './executionTrace'

describe('executionTrace — step count and ordering', () => {
  it('0 steps initially', () => {
    expect(createTrace().steps).toHaveLength(0)
  })

  it('1 step after one recordStep', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'S1', stepType: 'agent', input: 'i', output: 'o', durationMs: 100, status: 'done' })
    expect(trace.steps).toHaveLength(1)
  })

  it('5 steps after 5 recordStep calls', () => {
    const trace = createTrace()
    for (let i = 0; i < 5; i++) {
      recordStep(trace, { stepName: `S${i}`, stepType: 'agent', input: `i${i}`, output: `o${i}`, durationMs: i * 100, status: 'done' })
    }
    expect(trace.steps).toHaveLength(5)
  })

  it('step names are in insertion order', () => {
    const trace = createTrace()
    const names = ['Alpha', 'Beta', 'Gamma']
    names.forEach((name) => {
      recordStep(trace, { stepName: name, stepType: 'agent', input: 'i', output: 'o', durationMs: 100, status: 'done' })
    })
    expect(trace.steps.map((s) => s.stepName)).toEqual(names)
  })

  it('finalizeTrace does not change step count', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'Only', stepType: 'agent', input: 'i', output: 'o', durationMs: 100, status: 'done' })
    finalizeTrace(trace, { status: 'done' })
    expect(trace.steps).toHaveLength(1)
  })
})
