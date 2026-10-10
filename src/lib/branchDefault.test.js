import { describe, it, expect } from 'vitest'
import { selectBranch } from './pipelineBranching'

describe('selectBranch default handling', () => {
  it('matches case-insensitive Default branches', () => {
    expect(selectBranch('billing', { billing: ['a'], Default: ['b'] })).toBe('billing')
    expect(selectBranch('other', { billing: ['a'], Default: ['b'] })).toBe('Default')
    expect(selectBranch('default', { billing: ['a'], DEFAULT: ['b'] })).toBe('DEFAULT')
  })

  it('still returns null without any default', () => {
    expect(selectBranch('other', { billing: ['a'] })).toBeNull()
    expect(selectBranch('x', null)).toBeNull()
  })
})
