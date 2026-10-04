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

describe('pipelineBranching — all exports present', () => {
  it('isConditionalStep is a function', () => {
    expect(typeof isConditionalStep).toBe('function')
  })

  it('resolveTemplate is a function', () => {
    expect(typeof resolveTemplate).toBe('function')
  })

  it('selectBranch is a function', () => {
    expect(typeof selectBranch).toBe('function')
  })

  it('evaluateConditionalStep is a function', () => {
    expect(typeof evaluateConditionalStep).toBe('function')
  })

  it('validateConditionalStep is a function', () => {
    expect(typeof validateConditionalStep).toBe('function')
  })

  it('CONDITIONAL_STEP_TYPE is a string constant', () => {
    expect(typeof CONDITIONAL_STEP_TYPE).toBe('string')
  })

  it('DEFAULT_BRANCH is a string constant', () => {
    expect(typeof DEFAULT_BRANCH).toBe('string')
  })
})

describe('pipelineBranching — minimal round-trip', () => {
  const STEP = {
    id: 'r1',
    type: CONDITIONAL_STEP_TYPE,
    condition: '{{ input }}',
    branches: {
      yes: ['yes-agent'],
      no: ['no-agent'],
      default: ['maybe-agent'],
    },
  }

  it('step passes isConditionalStep check', () => {
    expect(isConditionalStep(STEP)).toBe(true)
  })

  it('passes validation with no errors', () => {
    expect(validateConditionalStep(STEP)).toHaveLength(0)
  })

  it('evaluates correctly with matching context', () => {
    const result = evaluateConditionalStep(STEP, { input: 'yes' })
    expect(result.branchLabel).toBe('yes')
    expect(result.branchAgents).toEqual(['yes-agent'])
  })

  it('resolveTemplate fills {{ input }} from context', () => {
    expect(resolveTemplate('{{ input }}', { input: 'yes' })).toBe('yes')
  })

  it('selectBranch selects from flat branches', () => {
    expect(selectBranch('no', STEP.branches)).toBe('no')
  })
})
