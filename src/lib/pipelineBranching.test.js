import { describe, it, expect } from 'vitest'
import {
  isConditionalStep,
  resolveTemplate,
  selectBranch,
  CONDITIONAL_STEP_TYPE,
  DEFAULT_BRANCH,
} from './pipelineBranching'

describe('isConditionalStep', () => {
  it('returns true for a conditional_branch object', () => {
    expect(isConditionalStep({ type: 'conditional_branch', id: 'r' })).toBe(true)
  })

  it('returns false for a plain string agent id', () => {
    expect(isConditionalStep('my-agent-id')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isConditionalStep(null)).toBe(false)
  })

  it('returns false for an object with wrong type', () => {
    expect(isConditionalStep({ type: 'agent' })).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isConditionalStep(undefined)).toBe(false)
  })
})

describe('resolveTemplate', () => {
  const context = {
    input: 'hello world',
    steps: {
      classify: { output: 'billing' },
      summarize: { output: 'A summary' },
    },
  }

  it('resolves a simple template', () => {
    expect(resolveTemplate('{{ input }}', context)).toBe('hello world')
  })

  it('resolves a nested path', () => {
    expect(resolveTemplate('{{ steps.classify.output }}', context)).toBe('billing')
  })

  it('returns empty string for unresolvable path', () => {
    expect(resolveTemplate('{{ steps.missing.output }}', context)).toBe('')
  })

  it('resolves multiple placeholders', () => {
    const result = resolveTemplate('{{ input }} — {{ steps.classify.output }}', context)
    expect(result).toBe('hello world — billing')
  })

  it('returns empty string for non-string template', () => {
    expect(resolveTemplate(null, context)).toBe('')
    expect(resolveTemplate(42, context)).toBe('')
  })

  it('returns template unchanged when no placeholders', () => {
    expect(resolveTemplate('plain text', context)).toBe('plain text')
  })
})

describe('selectBranch', () => {
  const branches = {
    billing: ['refund-writer'],
    technical: ['bug-reporter'],
    default: ['fallback-agent'],
  }

  it('selects exact matching branch (case-insensitive)', () => {
    expect(selectBranch('billing', branches)).toBe('billing')
  })

  it('selects branch case-insensitively', () => {
    expect(selectBranch('BILLING', branches)).toBe('billing')
  })

  it('selects branch with extra whitespace', () => {
    expect(selectBranch('  technical  ', branches)).toBe('technical')
  })

  it('falls back to default when no match', () => {
    expect(selectBranch('unknown_value', branches)).toBe('default')
  })

  it('returns null when no match and no default branch', () => {
    const noDef = { billing: ['a'], technical: ['b'] }
    expect(selectBranch('unknown', noDef)).toBeNull()
  })

  it('does not select default as a label match', () => {
    // 'default' is the fallback, not a label to match against
    expect(selectBranch('default', branches)).toBe('default')
  })
})

describe('Constants', () => {
  it('CONDITIONAL_STEP_TYPE is conditional_branch', () => {
    expect(CONDITIONAL_STEP_TYPE).toBe('conditional_branch')
  })

  it('DEFAULT_BRANCH is default', () => {
    expect(DEFAULT_BRANCH).toBe('default')
  })
})
