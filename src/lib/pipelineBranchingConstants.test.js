import { describe, it, expect } from 'vitest'
import { CONDITIONAL_STEP_TYPE, DEFAULT_BRANCH, isConditionalStep } from './pipelineBranching'

describe('Pipeline branching constants and type guard', () => {
  describe('constant values', () => {
    it('CONDITIONAL_STEP_TYPE is "conditional_branch"', () => {
      expect(CONDITIONAL_STEP_TYPE).toBe('conditional_branch')
    })

    it('DEFAULT_BRANCH is "default"', () => {
      expect(DEFAULT_BRANCH).toBe('default')
    })

    it('constants are strings', () => {
      expect(typeof CONDITIONAL_STEP_TYPE).toBe('string')
      expect(typeof DEFAULT_BRANCH).toBe('string')
    })

    it('constants are not empty', () => {
      expect(CONDITIONAL_STEP_TYPE.length).toBeGreaterThan(0)
      expect(DEFAULT_BRANCH.length).toBeGreaterThan(0)
    })
  })

  describe('isConditionalStep type guard', () => {
    it('returns true for minimal conditional step', () => {
      expect(isConditionalStep({ type: CONDITIONAL_STEP_TYPE })).toBe(true)
    })

    it('returns false when type is different string', () => {
      expect(isConditionalStep({ type: 'agent' })).toBe(false)
      expect(isConditionalStep({ type: 'parallel' })).toBe(false)
    })

    it('returns false for empty object', () => {
      expect(isConditionalStep({})).toBe(false)
    })

    it('returns false for number', () => {
      expect(isConditionalStep(42)).toBe(false)
    })

    it('returns false for boolean', () => {
      expect(isConditionalStep(true)).toBe(false)
    })

    it('returns false for array', () => {
      expect(isConditionalStep([])).toBe(false)
    })

    it('returns true with extra properties', () => {
      expect(isConditionalStep({ type: CONDITIONAL_STEP_TYPE, id: 'r1', branches: {} })).toBe(true)
    })
  })
})
