import { describe, it, expect } from 'vitest'
import { evaluateConditionalStep } from './pipelineBranching'

const STEP = {
  id: 'route',
  type: 'conditional_branch',
  condition: '{{ steps.classify.output }}',
  branches: {
    billing: ['refund-agent'],
    technical: ['debug-agent'],
    sales: ['upsell-agent'],
    default: ['general-agent'],
  },
}

describe('evaluateConditionalStep — comprehensive routing', () => {
  it('routes to billing branch', () => {
    const result = evaluateConditionalStep(STEP, { steps: { classify: { output: 'billing' } } })
    expect(result.branchLabel).toBe('billing')
    expect(result.branchAgents).toEqual(['refund-agent'])
  })

  it('routes to technical branch', () => {
    const result = evaluateConditionalStep(STEP, { steps: { classify: { output: 'technical' } } })
    expect(result.branchLabel).toBe('technical')
  })

  it('routes to sales branch', () => {
    const result = evaluateConditionalStep(STEP, { steps: { classify: { output: 'sales' } } })
    expect(result.branchLabel).toBe('sales')
  })

  it('routes to default when unrecognized output', () => {
    const result = evaluateConditionalStep(STEP, { steps: { classify: { output: 'complaint' } } })
    expect(result.branchLabel).toBe('default')
    expect(result.branchAgents).toEqual(['general-agent'])
  })

  it('routes to default when classify output is empty string', () => {
    const result = evaluateConditionalStep(STEP, { steps: { classify: { output: '' } } })
    expect(result.branchLabel).toBe('default')
  })

  it('provides conditionValue from resolved template', () => {
    const result = evaluateConditionalStep(STEP, { steps: { classify: { output: 'billing' } } })
    expect(result.conditionValue).toBe('billing')
  })

  it('case-insensitive routing: BILLING → billing branch', () => {
    const result = evaluateConditionalStep(STEP, { steps: { classify: { output: 'BILLING' } } })
    expect(result.branchLabel).toBe('billing')
  })

  it('whitespace-padded output routes correctly', () => {
    const result = evaluateConditionalStep(STEP, { steps: { classify: { output: '  technical  ' } } })
    expect(result.branchLabel).toBe('technical')
  })
})
