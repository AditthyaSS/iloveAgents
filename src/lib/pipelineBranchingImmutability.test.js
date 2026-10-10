import { describe, it, expect } from 'vitest'
import { resolveTemplate, selectBranch, evaluateConditionalStep, CONDITIONAL_STEP_TYPE, DEFAULT_BRANCH } from './pipelineBranching'

describe('pipelineBranching — immutability and side-effect-free guarantees', () => {
  describe('resolveTemplate does not mutate context', () => {
    it('context is unchanged after template resolution', () => {
      const context = { input: 'billing', steps: { classify: { output: 'tech' } } }
      const copy = JSON.parse(JSON.stringify(context))
      resolveTemplate('{{ input }}', context)
      expect(context).toEqual(copy)
    })
  })

  describe('selectBranch does not mutate branches', () => {
    it('branches object unchanged after selection', () => {
      const branches = { billing: ['a'], default: ['b'] }
      const keys = Object.keys(branches)
      selectBranch('billing', branches)
      expect(Object.keys(branches)).toEqual(keys)
    })
  })

  describe('evaluateConditionalStep does not mutate step or context', () => {
    it('step unchanged after evaluation', () => {
      const step = {
        id: 'r1',
        type: CONDITIONAL_STEP_TYPE,
        condition: '{{ input }}',
        branches: { yes: ['a'], [DEFAULT_BRANCH]: ['b'] },
      }
      const stepCopy = JSON.parse(JSON.stringify(step))
      evaluateConditionalStep(step, { input: 'yes' })
      expect(step).toEqual(stepCopy)
    })

    it('context unchanged after evaluation', () => {
      const context = { input: 'billing' }
      const step = {
        id: 'r1',
        type: CONDITIONAL_STEP_TYPE,
        condition: '{{ input }}',
        branches: { billing: ['a'], [DEFAULT_BRANCH]: ['b'] },
      }
      const ctxCopy = { ...context }
      evaluateConditionalStep(step, context)
      expect(context).toEqual(ctxCopy)
    })
  })
})
