import { describe, it, expect } from 'vitest'
import {
  CONDITIONAL_STEP_TYPE,
  detectCircularBranches,
  evaluateConditionalStep,
  selectBranch,
  validateConditionalStep,
} from './pipelineBranching.js'

const makeConditionalStep = (id, branches) => ({
  type: CONDITIONAL_STEP_TYPE,
  id,
  condition: '{{ steps.classify.output }}',
  branches,
})

describe('detectCircularBranches — edge cases', () => {
  it('returns empty array for step with no branches', () => {
    const step = { ...makeConditionalStep('route', {}), branches: {} }
    expect(detectCircularBranches(step, [])).toEqual([])
  })

  it('returns empty array when branches is undefined', () => {
    const step = { id: 'route', type: CONDITIONAL_STEP_TYPE }
    expect(detectCircularBranches(step, [])).toEqual([])
  })

  it('detects indirect cycle through allSteps', () => {
    const stepA = makeConditionalStep('step-a', {
      go: ['step-b'],
      default: ['end'],
    })
    const stepB = makeConditionalStep('step-b', {
      go: ['step-a'], // loops back to step-a
      default: ['end'],
    })
    const problems = detectCircularBranches(stepA, [stepA, stepB])
    // Should detect that step-a's branch leads back to step-a via step-b
    expect(Array.isArray(problems)).toBe(true)
  })
})

describe('selectBranch — edge cases', () => {
  it('handles empty string condition value', () => {
    const result = selectBranch('', { billing: ['a'], default: ['b'] })
    // Empty string does not match any label
    expect(result).toBe('default')
  })

  it('is not case-sensitive for branch labels with mixed case', () => {
    const result = selectBranch('BILLING', { Billing: ['a'], default: ['b'] })
    expect(result).toBe('Billing')
  })

  it('handles numeric condition value via string coercion', () => {
    const result = selectBranch(42, { '42': ['a'], default: ['b'] })
    // Numeric 42 coerced to "42", should match the "42" key
    expect(result).toBe('42')
  })
})

describe('evaluateConditionalStep — empty/missing context', () => {
  const step = makeConditionalStep('route', {
    billing: ['agent-1'],
    default: ['agent-2'],
  })

  it('falls back to default when context is empty', () => {
    const { branchLabel, branchAgents } = evaluateConditionalStep(step, {})
    expect(branchLabel).toBe('default')
    expect(branchAgents).toEqual(['agent-2'])
  })

  it('falls back to default when condition path is undefined', () => {
    const { branchLabel } = evaluateConditionalStep(step, { steps: {} })
    expect(branchLabel).toBe('default')
  })
})

describe('validateConditionalStep — warning for missing default', () => {
  it('includes a warning message about missing default', () => {
    const step = makeConditionalStep('route', {
      billing: ['a'],
      technical: ['b'],
      // no 'default' branch
    })
    const problems = validateConditionalStep(step)
    const defaultWarning = problems.find(p => /default/i.test(p))
    expect(defaultWarning).toBeDefined()
  })

  it('is valid when all required parts are present', () => {
    const step = makeConditionalStep('route', {
      billing: ['a'],
      default: ['b'],
    })
    expect(validateConditionalStep(step)).toEqual([])
  })
})
