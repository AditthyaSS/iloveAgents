import { describe, it, expect } from 'vitest'
import {
  isConditionalStep,
  resolveTemplate,
  selectBranch,
  evaluateConditionalStep,
  validateConditionalStep,
  detectCircularBranches,
  DEFAULT_BRANCH,
} from './pipelineBranching'

const step = {
  type: 'conditional_branch',
  id: 'route',
  condition: '{{ steps.classify.output }}',
  branches: {
    billing: ['refund-policy-writer'],
    technical: ['bug-report-generator'],
    default: ['eli5-explainer'],
  },
}

describe('isConditionalStep', () => {
  it('detects branch steps and ignores plain ids', () => {
    expect(isConditionalStep(step)).toBe(true)
    expect(isConditionalStep('refund-policy-writer')).toBe(false)
    expect(isConditionalStep(null)).toBe(false)
  })
})

describe('resolveTemplate', () => {
  it('resolves dotted paths and blanks unknowns without evaluating code', () => {
    const context = { input: 'hi', steps: { classify: { output: 'billing' } } }
    expect(resolveTemplate('{{ steps.classify.output }}', context)).toBe('billing')
    expect(resolveTemplate('prefix {{ steps.missing.deep }} suffix', context)).toBe('prefix  suffix')
    expect(resolveTemplate('{{ input.length }}', { input: [1, 2] })).toBe('2')
    expect(resolveTemplate(null, context)).toBe('')
  })
})

describe('selectBranch', () => {
  it('matches exactly after trim and case folding', () => {
    expect(selectBranch(' Billing ', step.branches)).toBe('billing')
    expect(selectBranch('TECHNICAL', step.branches)).toBe('technical')
  })

  it('falls back to default and returns null without one', () => {
    expect(selectBranch('unknown', step.branches)).toBe('default')
    expect(selectBranch('unknown', { billing: ['a'] })).toBeNull()
    expect(selectBranch('x', null)).toBeNull()
  })
})

describe('evaluateConditionalStep', () => {
  it('resolves the winning branch agents', () => {
    const context = { input: '', steps: { classify: { output: 'technical' } } }
    const res = evaluateConditionalStep(step, context)
    expect(res.branchLabel).toBe('technical')
    expect(res.branchAgents).toEqual(['bug-report-generator'])
  })

  it('takes default on unmatched values', () => {
    const res = evaluateConditionalStep(step, { input: '', steps: {} })
    expect(res.branchLabel).toBe(DEFAULT_BRANCH)
    expect(res.branchAgents).toEqual(['eli5-explainer'])
  })
})

describe('validateConditionalStep', () => {
  it('passes well formed steps', () => {
    expect(validateConditionalStep(step, [])).toEqual([])
  })

  it('flags missing id, condition, branches and default', () => {
    const problems = validateConditionalStep({ type: 'conditional_branch', branches: {} }, [])
    expect(problems.length).toBeGreaterThanOrEqual(3)
  })

  it('flags empty branches', () => {
    const problems = validateConditionalStep(
      { ...step, branches: { billing: [], default: ['a'] } },
      []
    )
    expect(problems.some((p) => p.includes('billing'))).toBe(true)
  })
})

describe('detectCircularBranches', () => {
  it('flags direct self references', () => {
    const problems = detectCircularBranches(step, [])
    expect(problems).toEqual([])
    const cyclic = {
      ...step,
      branches: { loop: ['route'], default: ['a'] },
    }
    expect(detectCircularBranches(cyclic, []).length).toBeGreaterThan(0)
  })

  it('flags indirect loops through other conditionals', () => {
    const first = {
      type: 'conditional_branch',
      id: 'first',
      branches: { go: ['second'], default: ['a'] },
    }
    const second = {
      type: 'conditional_branch',
      id: 'second',
      branches: { back: ['first'], default: ['b'] },
    }
    expect(detectCircularBranches(first, [first, second]).length).toBeGreaterThan(0)
  })

  it('ignores acyclic graphs', () => {
    const other = { type: 'conditional_branch', id: 'other', branches: { x: ['a'] } }
    expect(detectCircularBranches(step, [other])).toEqual([])
  })
})
