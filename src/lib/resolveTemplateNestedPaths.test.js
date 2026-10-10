import { describe, it, expect } from 'vitest'
import { resolveTemplate } from './pipelineBranching'

describe('resolveTemplate — deep nested path resolution', () => {
  describe('dot-separated paths', () => {
    it('resolves 2-level path', () => {
      const ctx = { a: { b: 'value' } }
      expect(resolveTemplate('{{ a.b }}', ctx)).toBe('value')
    })

    it('resolves 3-level path', () => {
      const ctx = { a: { b: { c: 'deep' } } }
      expect(resolveTemplate('{{ a.b.c }}', ctx)).toBe('deep')
    })

    it('resolves 4-level path', () => {
      const ctx = { a: { b: { c: { d: 'verydeep' } } } }
      expect(resolveTemplate('{{ a.b.c.d }}', ctx)).toBe('verydeep')
    })

    it('returns empty string for partial path that dead-ends', () => {
      const ctx = { a: { b: 'stop' } }
      expect(resolveTemplate('{{ a.b.c }}', ctx)).toBe('')
    })
  })

  describe('steps.agent.output pattern', () => {
    it('resolves steps.classify.output', () => {
      const ctx = { steps: { classify: { output: 'billing' } } }
      expect(resolveTemplate('{{ steps.classify.output }}', ctx)).toBe('billing')
    })

    it('resolves steps.summarize.output', () => {
      const ctx = { steps: { summarize: { output: 'Summary text' } } }
      expect(resolveTemplate('{{ steps.summarize.output }}', ctx)).toBe('Summary text')
    })

    it('handles missing step gracefully', () => {
      const ctx = { steps: {} }
      expect(resolveTemplate('{{ steps.missing.output }}', ctx)).toBe('')
    })
  })
})
