import { describe, it, expect } from 'vitest'
import { createTrace, recordStep, finalizeTrace, formatDuration } from './executionTrace'

describe('executionTrace — batch processing workflow', () => {
  it('simulates batch of 10 items, each with a step', () => {
    const trace = createTrace({ workflowTitle: 'Batch Summarizer' })

    for (let i = 0; i < 10; i++) {
      recordStep(trace, {
        stepName: `Item ${i + 1}`,
        stepType: 'agent',
        input: `Input text for item ${i + 1}`,
        output: `Summary for item ${i + 1}`,
        durationMs: 500 + i * 100,
        status: 'done',
      })
    }

    finalizeTrace(trace, { status: 'done', finalOutput: 'Batch complete' })

    expect(trace.steps).toHaveLength(10)
    expect(trace.status).toBe('done')

    // Total duration
    const total = trace.steps.reduce((s, step) => s + step.durationMs, 0)
    expect(total).toBe(5000 + (0+1+2+3+4+5+6+7+8+9) * 100) // 5000 + 4500 = 9500
    expect(total).toBe(9500)
    expect(formatDuration(total)).toBe('9.5s')
  })

  it('simulates partial failure: 8 done, 2 failed', () => {
    const trace = createTrace({ workflowTitle: 'Partial Failure Test' })

    for (let i = 0; i < 8; i++) {
      recordStep(trace, { stepName: `S${i}`, stepType: 'agent', input: 'i', output: 'o', durationMs: 200, status: 'done' })
    }

    recordStep(trace, { stepName: 'Fail1', stepType: 'agent', input: 'i', output: null, durationMs: 50, status: 'failed', error: 'Rate limit' })
    recordStep(trace, { stepName: 'Fail2', stepType: 'agent', input: 'i', output: null, durationMs: 30, status: 'failed', error: 'Timeout' })

    finalizeTrace(trace, { status: 'failed' })

    expect(trace.steps.filter((s) => s.status === 'done')).toHaveLength(8)
    expect(trace.steps.filter((s) => s.status === 'failed')).toHaveLength(2)
    expect(trace.status).toBe('failed')
  })
})
