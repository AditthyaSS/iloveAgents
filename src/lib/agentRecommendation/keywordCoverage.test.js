import { describe, it, expect } from 'vitest'
import { TASK_KEYWORDS, CAPABILITY_KEYWORDS } from './rules.js'

describe('TASK_KEYWORDS — comprehensive keyword coverage', () => {
  const CORE_TASKS = ['code', 'debug', 'review', 'analyze', 'write', 'research', 'summarize']

  CORE_TASKS.forEach((task) => {
    it(`${task} task has keywords defined`, () => {
      expect(TASK_KEYWORDS[task]).toBeDefined()
      expect(TASK_KEYWORDS[task].length).toBeGreaterThan(0)
    })
  })

  it('code task keywords include "api"', () => {
    expect(TASK_KEYWORDS.code).toContain('api')
  })

  it('code task keywords include "debug"', () => {
    expect(TASK_KEYWORDS.code).toContain('debug')
  })

  it('write task keywords include "email"', () => {
    expect(TASK_KEYWORDS.write).toContain('email')
  })

  it('research task keywords include "compare"', () => {
    expect(TASK_KEYWORDS.research).toContain('compare')
  })

  it('summarize task keywords include "summary"', () => {
    expect(TASK_KEYWORDS.summarize).toContain('summary')
  })

  it('all task keyword arrays contain lowercase strings', () => {
    for (const keywords of Object.values(TASK_KEYWORDS)) {
      for (const kw of keywords) {
        expect(kw).toBe(kw.toLowerCase())
      }
    }
  })
})

describe('CAPABILITY_KEYWORDS — coverage checks', () => {
  it('is a non-null object', () => {
    expect(CAPABILITY_KEYWORDS).toBeTruthy()
    expect(typeof CAPABILITY_KEYWORDS).toBe('object')
  })

  it('all keyword arrays are non-empty', () => {
    for (const keywords of Object.values(CAPABILITY_KEYWORDS)) {
      expect(keywords.length).toBeGreaterThan(0)
    }
  })
})
