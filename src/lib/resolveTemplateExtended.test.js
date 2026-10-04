import { describe, it, expect } from 'vitest'
import { resolveTemplate } from './pipelineBranching'

describe('resolveTemplate — comprehensive placeholder resolution', () => {
  describe('basic resolution', () => {
    it('resolves simple top-level key', () => {
      expect(resolveTemplate('{{ name }}', { name: 'Alice' })).toBe('Alice')
    })

    it('resolves with extra whitespace in placeholder', () => {
      expect(resolveTemplate('{{  name  }}', { name: 'Alice' })).toBe('Alice')
    })

    it('returns empty string for missing key', () => {
      expect(resolveTemplate('{{ missing }}', {})).toBe('')
    })

    it('replaces null value with empty string', () => {
      expect(resolveTemplate('{{ val }}', { val: null })).toBe('')
    })

    it('replaces undefined value with empty string', () => {
      expect(resolveTemplate('{{ val }}', { val: undefined })).toBe('')
    })
  })

  describe('nested path resolution', () => {
    it('resolves two-level nested path', () => {
      const ctx = { steps: { classify: { output: 'billing' } } }
      expect(resolveTemplate('{{ steps.classify.output }}', ctx)).toBe('billing')
    })

    it('resolves three-level nested path', () => {
      const ctx = { a: { b: { c: 'deep' } } }
      expect(resolveTemplate('{{ a.b.c }}', ctx)).toBe('deep')
    })

    it('returns empty for partial path that does not resolve fully', () => {
      const ctx = { steps: {} }
      expect(resolveTemplate('{{ steps.missing.output }}', ctx)).toBe('')
    })
  })

  describe('multiple placeholders', () => {
    it('replaces multiple different placeholders', () => {
      const ctx = { first: 'Hello', second: 'World' }
      expect(resolveTemplate('{{ first }} {{ second }}', ctx)).toBe('Hello World')
    })

    it('replaces same placeholder multiple times', () => {
      const ctx = { name: 'Bob' }
      expect(resolveTemplate('{{ name }} and {{ name }}', ctx)).toBe('Bob and Bob')
    })
  })

  describe('non-string template input', () => {
    it('returns empty string for null template', () => {
      expect(resolveTemplate(null, {})).toBe('')
    })

    it('returns empty string for undefined template', () => {
      expect(resolveTemplate(undefined, {})).toBe('')
    })

    it('returns empty string for number template', () => {
      expect(resolveTemplate(42, {})).toBe('')
    })
  })

  describe('numeric and boolean values', () => {
    it('converts number values to string', () => {
      expect(resolveTemplate('{{ count }}', { count: 42 })).toBe('42')
    })

    it('converts boolean values to string', () => {
      expect(resolveTemplate('{{ flag }}', { flag: true })).toBe('true')
    })
  })
})
