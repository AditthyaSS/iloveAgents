import { describe, it, expect } from 'vitest'
import { selectBranch } from './pipelineBranching'

describe('selectBranch — extended coverage', () => {
  describe('case and whitespace normalization', () => {
    const branches = {
      billing: ['agent1'],
      technical: ['agent2'],
      'account-management': ['agent3'],
      default: ['fallback'],
    }

    it('matches lowercase label exactly', () => {
      expect(selectBranch('billing', branches)).toBe('billing')
    })

    it('matches uppercase version (case-insensitive)', () => {
      expect(selectBranch('BILLING', branches)).toBe('billing')
    })

    it('matches mixed case', () => {
      expect(selectBranch('Billing', branches)).toBe('billing')
    })

    it('matches with leading whitespace', () => {
      expect(selectBranch('  billing', branches)).toBe('billing')
    })

    it('matches with trailing whitespace', () => {
      expect(selectBranch('billing  ', branches)).toBe('billing')
    })

    it('matches hyphenated label', () => {
      expect(selectBranch('account-management', branches)).toBe('account-management')
    })
  })

  describe('default fallback behavior', () => {
    const branches = { billing: ['a'], default: ['d'] }

    it('falls back when no match', () => {
      expect(selectBranch('unknown', branches)).toBe('default')
    })

    it('falls back for empty string condition', () => {
      expect(selectBranch('', branches)).toBe('default')
    })

    it('falls back for whitespace-only condition', () => {
      expect(selectBranch('   ', branches)).toBe('default')
    })

    it('returns null when no default and no match', () => {
      expect(selectBranch('x', { billing: ['a'] })).toBeNull()
    })
  })

  describe('null/undefined/invalid inputs', () => {
    const branches = { billing: ['a'], default: ['d'] }

    it('handles null condition value', () => {
      expect(selectBranch(null, branches)).toBe('default')
    })

    it('handles undefined condition value', () => {
      expect(selectBranch(undefined, branches)).toBe('default')
    })

    it('returns null for null branches', () => {
      expect(selectBranch('billing', null)).toBeNull()
    })

    it('returns null for non-object branches', () => {
      expect(selectBranch('billing', 'invalid')).toBeNull()
    })
  })
})
