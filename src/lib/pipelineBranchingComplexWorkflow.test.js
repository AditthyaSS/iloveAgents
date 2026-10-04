import { describe, it, expect } from 'vitest'
import { evaluateConditionalStep, validateConditionalStep, CONDITIONAL_STEP_TYPE, DEFAULT_BRANCH } from './pipelineBranching'

describe('pipelineBranching — complex multi-branch workflow', () => {
  const CUSTOMER_SUPPORT_ROUTER = {
    id: 'support-router',
    type: CONDITIONAL_STEP_TYPE,
    condition: '{{ steps.sentiment.output }}',
    branches: {
      angry: ['priority-agent', 'supervisor-alert'],
      confused: ['help-agent'],
      satisfied: ['upsell-agent'],
      neutral: ['feedback-agent'],
      [DEFAULT_BRANCH]: ['general-support'],
    },
  }

  it('has valid 5-branch configuration', () => {
    expect(validateConditionalStep(CUSTOMER_SUPPORT_ROUTER)).toHaveLength(0)
  })

  it('angry customer routes to priority handling', () => {
    const result = evaluateConditionalStep(CUSTOMER_SUPPORT_ROUTER, {
      steps: { sentiment: { output: 'angry' } }
    })
    expect(result.branchLabel).toBe('angry')
    expect(result.branchAgents).toEqual(['priority-agent', 'supervisor-alert'])
  })

  it('multiple agents in a branch all returned', () => {
    const result = evaluateConditionalStep(CUSTOMER_SUPPORT_ROUTER, {
      steps: { sentiment: { output: 'angry' } }
    })
    expect(result.branchAgents).toHaveLength(2)
  })

  it('neutral falls to neutral branch (not default)', () => {
    const result = evaluateConditionalStep(CUSTOMER_SUPPORT_ROUTER, {
      steps: { sentiment: { output: 'neutral' } }
    })
    expect(result.branchLabel).toBe('neutral')
    expect(result.branchLabel).not.toBe(DEFAULT_BRANCH)
  })

  it('completely unknown sentiment falls to default', () => {
    const result = evaluateConditionalStep(CUSTOMER_SUPPORT_ROUTER, {
      steps: { sentiment: { output: 'delighted' } }
    })
    expect(result.branchLabel).toBe(DEFAULT_BRANCH)
  })

  it('all 4 recognized sentiments route correctly', () => {
    const cases = ['angry', 'confused', 'satisfied', 'neutral']
    for (const sentiment of cases) {
      const result = evaluateConditionalStep(CUSTOMER_SUPPORT_ROUTER, {
        steps: { sentiment: { output: sentiment } }
      })
      expect(result.branchLabel).toBe(sentiment)
    }
  })
})
