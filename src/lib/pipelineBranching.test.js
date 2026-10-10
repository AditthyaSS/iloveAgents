import { describe, it, expect } from 'vitest'
import {
  CONDITIONAL_STEP_TYPE,
  DEFAULT_BRANCH,
  isConditionalStep,
  resolveTemplate,
  selectBranch,
  evaluateConditionalStep,
  validateConditionalStep,
  detectCircularBranches,
} from './pipelineBranching.js'

const makeStep = (overrides = {}) => ({
  type: CONDITIONAL_STEP_TYPE,
  id: 'route',
  condition: '{{ steps.classify.output }}',
  branches: {
    billing: ['refund-agent'],
    technical: ['debug-agent'],
    default: ['fallback-agent'],
  },
  ...overrides,
})

describe('isConditionalStep', () => {
  it('returns true for a conditional step object', () => {
    expect(isConditionalStep(makeStep())).toBe(true)
  })

  it('returns false for a plain string', () => {
    expect(isConditionalStep('some-agent')).toBe(false)
  })

  it('returns false for null and undefined', () => {
    expect(isConditionalStep(null)).toBe(false)
    expect(isConditionalStep(undefined)).toBe(false)
  })

  it('returns false for an object without the expected type', () => {
    expect(isConditionalStep({ type: 'agent', id: 'x' })).toBe(false)
  })
})

describe('resolveTemplate', () => {
  it('replaces a single placeholder', () => {
    const context = { steps: { classify: { output: 'billing' } } }
    expect(resolveTemplate('{{ steps.classify.output }}', context)).toBe('billing')
  })

  it('replaces multiple placeholders', () => {
    const context = { input: 'hello', steps: { s1: { output: 'world' } } }
    expect(resolveTemplate('{{ input }} {{ steps.s1.output }}', context)).toBe('hello world')
  })

  it('renders empty string for unresolvable paths', () => {
    expect(resolveTemplate('{{ missing.path }}', {})).toBe('')
  })

  it('preserves surrounding text', () => {
    const context = { steps: { s: { output: 'X' } } }
    expect(resolveTemplate('prefix {{ steps.s.output }} suffix', context)).toBe('prefix X suffix')
  })

  it('returns empty string for non-string template', () => {
    expect(resolveTemplate(null, {})).toBe('')
    expect(resolveTemplate(42, {})).toBe('')
  })

  it('is safe — does not evaluate code expressions (returns template as-is)', () => {
    const result = resolveTemplate('{{ 1+1 }}', {})
    expect(result).not.toBe('2')
  })
})

describe('selectBranch', () => {
  const branches = { billing: ['a'], technical: ['b'], default: ['c'] }

  it('selects the matching branch label', () => {
    expect(selectBranch('billing', branches)).toBe('billing')
  })

  it('is case-insensitive', () => {
    expect(selectBranch('BILLING', branches)).toBe('billing')
    expect(selectBranch('Technical', branches)).toBe('technical')
  })

  it('trims whitespace before matching', () => {
    expect(selectBranch('  billing  ', branches)).toBe('billing')
  })

  it('falls back to "default" when no label matches', () => {
    expect(selectBranch('unknown', branches)).toBe(DEFAULT_BRANCH)
  })

  it('returns null when there is no default and no match', () => {
    const noDef = { billing: ['a'] }
    expect(selectBranch('unknown', noDef)).toBeNull()
  })

  it('returns null for null or non-object branches', () => {
    expect(selectBranch('billing', null)).toBeNull()
    expect(selectBranch('billing', 'not-an-object')).toBeNull()
  })

  it('does not match "default" explicitly when another label matches', () => {
    const b = { default: ['x'], billing: ['y'] }
    expect(selectBranch('billing', b)).toBe('billing')
  })
})

describe('evaluateConditionalStep', () => {
  it('returns the matched branch and its agents', () => {
    const step = makeStep()
    const context = { steps: { classify: { output: 'billing' } } }
    const { conditionValue, branchLabel, branchAgents } = evaluateConditionalStep(step, context)
    expect(conditionValue).toBe('billing')
    expect(branchLabel).toBe('billing')
    expect(branchAgents).toEqual(['refund-agent'])
  })

  it('falls back to default when no match', () => {
    const step = makeStep()
    const context = { steps: { classify: { output: 'unknown_category' } } }
    const { branchLabel, branchAgents } = evaluateConditionalStep(step, context)
    expect(branchLabel).toBe(DEFAULT_BRANCH)
    expect(branchAgents).toEqual(['fallback-agent'])
  })

  it('returns empty branchAgents when no branch matches and no default', () => {
    const step = makeStep({ branches: { billing: ['a'] } })
    const context = { steps: { classify: { output: 'other' } } }
    const { branchLabel, branchAgents } = evaluateConditionalStep(step, context)
    expect(branchLabel).toBeNull()
    expect(branchAgents).toEqual([])
  })
})

describe('validateConditionalStep', () => {
  it('returns empty array for a valid step', () => {
    expect(validateConditionalStep(makeStep())).toEqual([])
  })

  it('flags missing id', () => {
    const problems = validateConditionalStep(makeStep({ id: '' }))
    expect(problems.some(p => /id/i.test(p))).toBe(true)
  })

  it('flags missing condition', () => {
    const problems = validateConditionalStep(makeStep({ condition: '' }))
    expect(problems.some(p => /condition/i.test(p))).toBe(true)
  })

  it('flags empty branches', () => {
    const problems = validateConditionalStep(makeStep({ branches: {} }))
    expect(problems.some(p => /no branches/i.test(p))).toBe(true)
  })

  it('flags missing default branch', () => {
    const problems = validateConditionalStep(makeStep({ branches: { billing: ['a'] } }))
    expect(problems.some(p => /default/i.test(p))).toBe(true)
  })

  it('flags a branch with no agents', () => {
    const step = makeStep({ branches: { billing: [], default: ['x'] } })
    const problems = validateConditionalStep(step)
    expect(problems.some(p => /billing/i.test(p))).toBe(true)
  })
})

describe('detectCircularBranches', () => {
  it('returns no problems for a non-cyclic step', () => {
    const problems = detectCircularBranches(makeStep(), [])
    expect(problems).toEqual([])
  })

  it('detects a self-referencing branch (direct cycle)', () => {
    const step = makeStep({
      id: 'route',
      branches: { loop: ['route'], default: ['x'] }
    })
    const problems = detectCircularBranches(step, [step])
    expect(problems.length).toBeGreaterThan(0)
    expect(problems.some(p => /cycle/i.test(p))).toBe(true)
  })
})
