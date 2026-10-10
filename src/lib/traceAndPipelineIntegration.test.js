import { describe, it, expect } from 'vitest'
import { createTrace, recordStep, finalizeTrace, formatDuration } from './executionTrace'
import { evaluateConditionalStep, CONDITIONAL_STEP_TYPE, DEFAULT_BRANCH } from './pipelineBranching'

describe('executionTrace + pipelineBranching combined', () => {
  it('evaluates a conditional step and records result as a trace step', () => {
    const conditionalStep = {
      id: 'router',
      type: CONDITIONAL_STEP_TYPE,
      condition: '{{ steps.classifier.output }}',
      branches: {
        billing: ['billing-agent'],
        [DEFAULT_BRANCH]: ['general-agent'],
      },
    }

    const context = { steps: { classifier: { output: 'billing' } } }
    const result = evaluateConditionalStep(conditionalStep, context)

    // Record the routing decision as a trace step
    const trace = createTrace({ workflowTitle: 'Support Router' })
    recordStep(trace, {
      stepName: `Route: ${result.branchLabel}`,
      stepType: 'pipeline',
      input: context.steps.classifier.output,
      output: result.branchAgents.join(', '),
      durationMs: 50,
      status: 'done',
    })
    finalizeTrace(trace, { status: 'done', finalOutput: result.branchAgents[0] })

    expect(result.branchLabel).toBe('billing')
    expect(trace.steps[0].stepType).toBe('pipeline')
    expect(trace.status).toBe('done')
    expect(formatDuration(trace.steps[0].durationMs)).toBe('50ms')
  })
})
