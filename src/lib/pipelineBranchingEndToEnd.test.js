import { describe, it, expect } from 'vitest'
import {
  isConditionalStep,
  resolveTemplate,
  selectBranch,
  evaluateConditionalStep,
  validateConditionalStep,
  CONDITIONAL_STEP_TYPE,
  DEFAULT_BRANCH,
} from './pipelineBranching'

describe('pipelineBranching — end-to-end conditional routing', () => {
  const SUPPORT_ROUTER = {
    id: 'support-router',
    type: CONDITIONAL_STEP_TYPE,
    condition: '{{ steps.classifier.output }}',
    branches: {
      billing: ['billing-specialist'],
      technical: ['tech-support'],
      returns: ['returns-handler'],
      [DEFAULT_BRANCH]: ['general-support'],
    },
  }

  it('passes isConditionalStep check', () => {
    expect(isConditionalStep(SUPPORT_ROUTER)).toBe(true)
  })

  it('validates with no problems', () => {
    expect(validateConditionalStep(SUPPORT_ROUTER)).toHaveLength(0)
  })

  it('resolves condition template from context', () => {
    const context = { steps: { classifier: { output: 'billing' } } }
    const resolved = resolveTemplate(SUPPORT_ROUTER.condition, context)
    expect(resolved).toBe('billing')
  })

  it('selects billing branch', () => {
    expect(selectBranch('billing', SUPPORT_ROUTER.branches)).toBe('billing')
  })

  it('evaluates to billing branch with billing context', () => {
    const result = evaluateConditionalStep(SUPPORT_ROUTER, {
      steps: { classifier: { output: 'billing' } },
    })
    expect(result.branchLabel).toBe('billing')
    expect(result.branchAgents).toEqual(['billing-specialist'])
    expect(result.conditionValue).toBe('billing')
  })

  it('evaluates to default for unrecognized category', () => {
    const result = evaluateConditionalStep(SUPPORT_ROUTER, {
      steps: { classifier: { output: 'feedback' } },
    })
    expect(result.branchLabel).toBe(DEFAULT_BRANCH)
    expect(result.branchAgents).toEqual(['general-support'])
  })

  it('evaluates case-insensitively', () => {
    const result = evaluateConditionalStep(SUPPORT_ROUTER, {
      steps: { classifier: { output: 'TECHNICAL' } },
    })
    expect(result.branchLabel).toBe('technical')
  })

  it('full 4-branch routing works independently', () => {
    const categories = ['billing', 'technical', 'returns', 'unknown']
    const expected = ['billing', 'technical', 'returns', DEFAULT_BRANCH]
    categories.forEach((cat, i) => {
      const result = evaluateConditionalStep(SUPPORT_ROUTER, {
        steps: { classifier: { output: cat } },
      })
      expect(result.branchLabel).toBe(expected[i])
    })
  })
})
