import { describe, it, expect } from 'vitest'
import { createTrace, recordStep, finalizeTrace } from './executionTrace'

describe('executionTrace — stress and multiple-step scenarios', () => {
  it('records 50 steps without error', () => {
    const trace = createTrace({ workflowTitle: 'Long Workflow' })
    for (let i = 0; i < 50; i++) {
      recordStep(trace, {
        stepName: `Step ${i + 1}`,
        stepType: 'agent',
        input: `input_${i}`,
        output: `output_${i}`,
        durationMs: i * 100,
        status: 'done',
      })
    }
    expect(trace.steps).toHaveLength(50)
    expect(trace.steps[49].stepName).toBe('Step 50')
  })

  it('mix of done and failed steps', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'S1', stepType: 'agent', input: 'i', output: 'o', durationMs: 100, status: 'done' })
    recordStep(trace, { stepName: 'S2', stepType: 'agent', input: 'i', output: null, durationMs: 50, status: 'failed', error: 'API timeout' })
    recordStep(trace, { stepName: 'S3', stepType: 'agent', input: 'i', output: 'o2', durationMs: 200, status: 'done' })

    expect(trace.steps.filter((s) => s.status === 'done')).toHaveLength(2)
    expect(trace.steps.filter((s) => s.status === 'failed')).toHaveLength(1)
  })

  it('finalizing after steps preserves all step data', () => {
    const trace = createTrace({ workflowTitle: 'Test' })
    recordStep(trace, { stepName: 'Only Step', stepType: 'agent', input: 'query', output: 'answer', durationMs: 500, status: 'done' })
    finalizeTrace(trace, { status: 'done', finalOutput: 'Final answer' })

    expect(trace.steps).toHaveLength(1)
    expect(trace.steps[0].stepName).toBe('Only Step')
    expect(trace.finalOutput).toContain('Final answer')
    expect(trace.status).toBe('done')
  })

  it('trace with zero duration step is valid', () => {
    const trace = createTrace()
    recordStep(trace, { stepName: 'Instant', stepType: 'agent', input: 'fast', output: 'result', durationMs: 0, status: 'done' })
    expect(trace.steps[0].durationMs).toBe(0)
  })

  it('accumulates total duration correctly across all steps', () => {
    const trace = createTrace()
    const durations = [100, 250, 75, 400]
    durations.forEach((d, i) => {
      recordStep(trace, { stepName: `S${i}`, stepType: 'agent', input: 'i', output: 'o', durationMs: d, status: 'done' })
    })
    const totalMs = trace.steps.reduce((s, step) => s + step.durationMs, 0)
    expect(totalMs).toBe(825)
  })
})
