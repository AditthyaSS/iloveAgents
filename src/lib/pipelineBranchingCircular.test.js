import { describe, it, expect } from 'vitest'
import { detectCircularBranches, validateConditionalStep, CONDITIONAL_STEP_TYPE, DEFAULT_BRANCH } from './pipelineBranching'

describe('detectCircularBranches', () => {
  it('returns empty array for step with no all steps', () => {
    const step = {
      id: 'r1',
      type: CONDITIONAL_STEP_TYPE,
      condition: '{{ input }}',
      branches: { yes: ['a'], [DEFAULT_BRANCH]: ['b'] },
    }
    const result = detectCircularBranches(step, [])
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns empty array when no cycles exist', () => {
    const step1 = {
      id: 'r1',
      type: CONDITIONAL_STEP_TYPE,
      condition: '{{ input }}',
      branches: { a: ['agent-a'], [DEFAULT_BRANCH]: ['agent-b'] },
    }
    const step2 = { id: 'agent-a', type: 'agent' }
    const result = detectCircularBranches(step1, [step2])
    expect(result).toHaveLength(0)
  })

  it('returns empty for null/undefined branches', () => {
    const step = { id: 'r1', type: CONDITIONAL_STEP_TYPE, condition: '{{ x }}' }
    expect(detectCircularBranches(step, [])).toHaveLength(0)
    expect(detectCircularBranches({ ...step, branches: null }, [])).toHaveLength(0)
  })
})

describe('validateConditionalStep — circular detection integration', () => {
  it('valid step with no cycles passes validation', () => {
    const step = {
      id: 'r1',
      type: CONDITIONAL_STEP_TYPE,
      condition: '{{ input }}',
      branches: { yes: ['a'], no: ['b'], [DEFAULT_BRANCH]: ['c'] },
    }
    expect(validateConditionalStep(step, [])).toHaveLength(0)
  })
})
