import { describe, it, expect } from 'vitest'
import { validateConditionalStep, CONDITIONAL_STEP_TYPE, DEFAULT_BRANCH } from './pipelineBranching'

describe('validateConditionalStep — all error cases', () => {
  const VALID = {
    id: 'r1',
    type: CONDITIONAL_STEP_TYPE,
    condition: '{{ input }}',
    branches: {
      yes: ['agent-a'],
      no: ['agent-b'],
      [DEFAULT_BRANCH]: ['fallback'],
    },
  }

  it('valid step → 0 problems', () => {
    expect(validateConditionalStep(VALID)).toHaveLength(0)
  })

  it('missing id → 1+ problems', () => {
    const { id: _, ...noId } = VALID
    expect(validateConditionalStep(noId).length).toBeGreaterThan(0)
  })

  it('missing condition → 1+ problems', () => {
    const { condition: _, ...noCond } = VALID
    expect(validateConditionalStep(noCond).length).toBeGreaterThan(0)
  })

  it('empty branches → 1+ problems', () => {
    expect(validateConditionalStep({ ...VALID, branches: {} }).length).toBeGreaterThan(0)
  })

  it('missing default branch → 1+ problems (warning)', () => {
    const noDefault = { ...VALID, branches: { yes: ['a'], no: ['b'] } }
    expect(validateConditionalStep(noDefault).length).toBeGreaterThan(0)
  })

  it('empty agent list in branch → 1+ problems', () => {
    const emptyBranch = { ...VALID, branches: { ...VALID.branches, yes: [] } }
    expect(validateConditionalStep(emptyBranch).length).toBeGreaterThan(0)
  })

  it('problems are strings', () => {
    const { id: _, ...noId } = VALID
    const problems = validateConditionalStep(noId)
    problems.forEach((p) => expect(typeof p).toBe('string'))
  })
})
