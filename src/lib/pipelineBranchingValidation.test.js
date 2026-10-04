import { describe, it, expect } from 'vitest'
import { validateConditionalStep, evaluateConditionalStep } from './pipelineBranching'

describe('validateConditionalStep', () => {
  const validStep = {
    id: 'route',
    type: 'conditional_branch',
    condition: '{{ steps.classify.output }}',
    branches: {
      billing: ['refund-writer'],
      technical: ['bug-reporter'],
      default: ['fallback-agent'],
    },
  }

  it('returns no problems for a valid step', () => {
    expect(validateConditionalStep(validStep)).toHaveLength(0)
  })

  it('reports problem when id is missing', () => {
    const { id: _, ...noId } = validStep
    const problems = validateConditionalStep(noId)
    expect(problems.some((p) => p.includes('id'))).toBe(true)
  })

  it('reports problem when condition is missing', () => {
    const { condition: _, ...noCond } = validStep
    const problems = validateConditionalStep(noCond)
    expect(problems.some((p) => p.includes('condition'))).toBe(true)
  })

  it('reports problem when no branches are defined', () => {
    const noBranches = { ...validStep, branches: {} }
    const problems = validateConditionalStep(noBranches)
    expect(problems.some((p) => p.includes('branches'))).toBe(true)
  })

  it('reports problem when default branch is missing', () => {
    const noDefault = {
      ...validStep,
      branches: { billing: ['refund-writer'] },
    }
    const problems = validateConditionalStep(noDefault)
    expect(problems.some((p) => p.toLowerCase().includes('default'))).toBe(true)
  })

  it('reports problem when a branch has empty agent array', () => {
    const emptyBranch = {
      ...validStep,
      branches: {
        ...validStep.branches,
        billing: [],
      },
    }
    const problems = validateConditionalStep(emptyBranch)
    expect(problems.some((p) => p.includes('billing'))).toBe(true)
  })
})

describe('evaluateConditionalStep', () => {
  const step = {
    id: 'route',
    type: 'conditional_branch',
    condition: '{{ steps.classify.output }}',
    branches: {
      billing: ['refund-writer'],
      technical: ['bug-reporter'],
      default: ['fallback-agent'],
    },
  }

  it('selects correct branch when condition matches', () => {
    const context = { steps: { classify: { output: 'billing' } } }
    const result = evaluateConditionalStep(step, context)
    expect(result.branchLabel).toBe('billing')
    expect(result.branchAgents).toEqual(['refund-writer'])
  })

  it('falls back to default when condition does not match any label', () => {
    const context = { steps: { classify: { output: 'unknown_category' } } }
    const result = evaluateConditionalStep(step, context)
    expect(result.branchLabel).toBe('default')
  })

  it('provides conditionValue in result', () => {
    const context = { steps: { classify: { output: 'technical' } } }
    const result = evaluateConditionalStep(step, context)
    expect(result.conditionValue).toBe('technical')
  })
})
