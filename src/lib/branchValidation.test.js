import { describe, it, expect } from 'vitest'
import { validateConditionalStep } from './pipelineBranching'

const base = {
  id: 'route',
  type: 'conditional_branch',
  condition: '{{ steps.c.output }}',
  branches: { billing: ['a1'], default: ['a2'] },
}

describe('validateConditionalStep shape checks', () => {
  it('flags case-colliding labels', () => {
    const problems = validateConditionalStep({
      ...base,
      branches: { Billing: ['a1'], billing: ['a2'], default: ['a3'] },
    })
    expect(problems.some((p) => p.includes('Billing') || p.includes('billing'))).toBe(true)
  })

  it('flags non-string branch entries', () => {
    const problems = validateConditionalStep({
      ...base,
      branches: { billing: [42, null], default: ['a2'] },
    })
    expect(problems.some((p) => p.includes('non-agent'))).toBe(true)
  })

  it('passes clean definitions', () => {
    expect(validateConditionalStep(base)).toEqual([])
  })
})
