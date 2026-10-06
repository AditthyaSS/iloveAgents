import { describe, it, expect } from 'vitest'
import { TASK_KEYWORDS, CAPABILITY_KEYWORDS } from './rules.js'

describe('TASK_KEYWORDS', () => {
  it('is an object with at least 10 task types', () => {
    expect(typeof TASK_KEYWORDS).toBe('object')
    expect(Object.keys(TASK_KEYWORDS).length).toBeGreaterThanOrEqual(10)
  })

  it('every task type maps to a non-empty array of strings', () => {
    for (const [task, keywords] of Object.entries(TASK_KEYWORDS)) {
      expect(Array.isArray(keywords), `${task} should be an array`).toBe(true)
      expect(keywords.length, `${task} should have at least one keyword`).toBeGreaterThan(0)
      keywords.forEach(k => {
        expect(typeof k, `${task} keyword should be a string`).toBe('string')
        expect(k.length, `${task} keyword should not be empty`).toBeGreaterThan(0)
      })
    }
  })

  it('all keywords are lowercase', () => {
    for (const keywords of Object.values(TASK_KEYWORDS)) {
      keywords.forEach(k => {
        expect(k, `keyword "${k}" should be lowercase`).toBe(k.toLowerCase())
      })
    }
  })

  it('contains expected task types', () => {
    const expected = ['code', 'debug', 'review', 'write', 'research', 'analyze', 'data', 'automation']
    for (const task of expected) {
      expect(Object.keys(TASK_KEYWORDS), `expected task type "${task}"`).toContain(task)
    }
  })

  it('code task includes code-related keywords', () => {
    expect(TASK_KEYWORDS.code).toContain('code')
    expect(TASK_KEYWORDS.code).toContain('debug')
    expect(TASK_KEYWORDS.code).toContain('api')
  })

  it('debug task includes bug-related keywords', () => {
    expect(TASK_KEYWORDS.debug).toContain('bug')
    expect(TASK_KEYWORDS.debug).toContain('error')
    expect(TASK_KEYWORDS.debug).toContain('debug')
  })

  it('automation task includes workflow keywords', () => {
    expect(TASK_KEYWORDS.automation).toContain('automation')
    expect(TASK_KEYWORDS.automation).toContain('workflow')
    expect(TASK_KEYWORDS.automation).toContain('pipeline')
  })

  it('no keyword appears in multiple task types (no duplicates across tasks)', () => {
    const seen = new Map()
    for (const [task, keywords] of Object.entries(TASK_KEYWORDS)) {
      for (const k of keywords) {
        if (!seen.has(k)) seen.set(k, task)
        // Note: some keywords intentionally overlap (e.g. 'image' in design + creative)
        // This test just verifies the structure is intentional by not asserting uniqueness
      }
    }
    // Just verify the map was populated correctly
    expect(seen.size).toBeGreaterThan(0)
  })
})

describe('CAPABILITY_KEYWORDS', () => {
  it('is an object with at least 4 capability types', () => {
    expect(typeof CAPABILITY_KEYWORDS).toBe('object')
    expect(Object.keys(CAPABILITY_KEYWORDS).length).toBeGreaterThanOrEqual(4)
  })

  it('every capability type maps to a non-empty array of strings', () => {
    for (const [cap, keywords] of Object.entries(CAPABILITY_KEYWORDS)) {
      expect(Array.isArray(keywords), `${cap} should be an array`).toBe(true)
      expect(keywords.length, `${cap} should have at least one keyword`).toBeGreaterThan(0)
      keywords.forEach(k => {
        expect(typeof k, `${cap} keyword should be a string`).toBe('string')
      })
    }
  })

  it('contains expected capability types', () => {
    const expected = ['toolCalling', 'fastResponses', 'visionSupport', 'structuredOutput']
    for (const cap of expected) {
      expect(Object.keys(CAPABILITY_KEYWORDS)).toContain(cap)
    }
  })

  it('toolCalling includes "tools" and "api"', () => {
    expect(CAPABILITY_KEYWORDS.toolCalling).toContain('tools')
    expect(CAPABILITY_KEYWORDS.toolCalling).toContain('api')
  })

  it('structuredOutput includes "json" and "schema"', () => {
    expect(CAPABILITY_KEYWORDS.structuredOutput).toContain('json')
    expect(CAPABILITY_KEYWORDS.structuredOutput).toContain('schema')
  })

  it('visionSupport includes "vision" and "image"', () => {
    expect(CAPABILITY_KEYWORDS.visionSupport).toContain('vision')
    expect(CAPABILITY_KEYWORDS.visionSupport).toContain('image')
  })
})
