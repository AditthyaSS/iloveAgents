import { describe, it, expect } from 'vitest'
import { createTrace, recordStep, finalizeTrace, formatDuration } from './executionTrace'

describe('executionTrace — complete multi-agent workflow simulation', () => {
  it('simulates a 3-step workflow from create to finalize', () => {
    const trace = createTrace({ workflowTitle: 'SEO Content Pipeline', workflowId: 'wf-123' })

    // Step 1: Research
    recordStep(trace, {
      stepName: 'Research Agent',
      stepType: 'agent',
      input: 'climate change 2026',
      output: 'Top 10 climate trends for 2026...',
      durationMs: 3200,
      status: 'done',
    })

    // Step 2: Write
    recordStep(trace, {
      stepName: 'Content Writer',
      stepType: 'agent',
      input: 'Top 10 climate trends for 2026...',
      output: 'Article: Climate Change in 2026: What You Need to Know...',
      durationMs: 8100,
      status: 'done',
    })

    // Step 3: SEO Optimizer
    recordStep(trace, {
      stepName: 'SEO Optimizer',
      stepType: 'agent',
      input: 'Article: Climate Change in 2026...',
      output: 'Optimized article with meta description...',
      durationMs: 2300,
      status: 'done',
    })

    finalizeTrace(trace, {
      status: 'done',
      finalOutput: 'Optimized article with meta description...',
    })

    // Verify complete workflow state
    expect(trace.workflowTitle).toBe('SEO Content Pipeline')
    expect(trace.workflowId).toBe('wf-123')
    expect(trace.steps).toHaveLength(3)
    expect(trace.status).toBe('done')
    expect(trace.finalOutput).toBeTruthy()
    expect(trace.endedAt).not.toBeNull()

    // Verify all steps are done
    expect(trace.steps.every((s) => s.status === 'done')).toBe(true)

    // Verify total duration
    const totalDuration = trace.steps.reduce((sum, s) => sum + s.durationMs, 0)
    expect(totalDuration).toBe(13600)
    expect(formatDuration(totalDuration)).toBe('13.6s')
  })
})
