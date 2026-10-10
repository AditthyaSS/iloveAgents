import { describe, it, expect } from 'vitest'
import { selectBranch } from './pipelineBranching'

describe('selectBranch — numeric and special label scenarios', () => {
  const branches = {
    '1': ['agent-1'],
    '2': ['agent-2'],
    high: ['high-agent'],
    low: ['low-agent'],
    default: ['fallback'],
  }

  it('selects numeric label "1"', () => {
    expect(selectBranch('1', branches)).toBe('1')
  })

  it('selects numeric label "2"', () => {
    expect(selectBranch('2', branches)).toBe('2')
  })

  it('falls back to default for unknown number "3"', () => {
    expect(selectBranch('3', branches)).toBe('default')
  })

  it('matches case-insensitive "HIGH" → high', () => {
    expect(selectBranch('HIGH', branches)).toBe('high')
  })

  it('matches "LOW" → low', () => {
    expect(selectBranch('LOW', branches)).toBe('low')
  })

  it('numeric value in string "  1  " matches after trimming', () => {
    expect(selectBranch('  1  ', branches)).toBe('1')
  })

  it('null falls back to default', () => {
    expect(selectBranch(null, branches)).toBe('default')
  })

  it('0 falls back to default (not a branch label)', () => {
    expect(selectBranch('0', branches)).toBe('default')
  })
})
