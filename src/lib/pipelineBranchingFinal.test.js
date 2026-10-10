import { describe, it, expect } from 'vitest'
import { isConditionalStep, resolveTemplate, selectBranch, CONDITIONAL_STEP_TYPE, DEFAULT_BRANCH } from './pipelineBranching'

describe('pipelineBranching — final smoke tests', () => {
  it('can create and check a valid conditional step', () => {
    const step = { type: CONDITIONAL_STEP_TYPE, id: 'r1', condition: '{{ input }}', branches: { yes: ['a'], [DEFAULT_BRANCH]: ['b'] } }
    expect(isConditionalStep(step)).toBe(true)
  })

  it('can resolve a template', () => {
    expect(resolveTemplate('Hello {{ name }}', { name: 'World' })).toBe('Hello World')
  })

  it('can select a branch', () => {
    const branches = { good: ['agent-a'], [DEFAULT_BRANCH]: ['agent-b'] }
    expect(selectBranch('good', branches)).toBe('good')
    expect(selectBranch('unknown', branches)).toBe(DEFAULT_BRANCH)
  })

  it('all constants are strings', () => {
    expect(typeof CONDITIONAL_STEP_TYPE).toBe('string')
    expect(typeof DEFAULT_BRANCH).toBe('string')
  })

  it('template with missing key returns empty string', () => {
    expect(resolveTemplate('{{ missing }}', {})).toBe('')
  })

  it('isConditionalStep returns false for plain string', () => {
    expect(isConditionalStep('agent-id')).toBe(false)
  })
})
