import { describe, it, expect } from 'vitest'
import { TASK_KEYWORDS, CAPABILITY_KEYWORDS } from './rules.js'

describe('TASK_KEYWORDS — keyword coverage verification', () => {
  const expectedKeywords = {
    code: ['api', 'sql', 'test', 'debug', 'developer'],
    debug: ['debug', 'bug', 'error', 'troubleshoot'],
    write: ['write', 'email', 'post', 'copy'],
    research: ['research', 'compare', 'market'],
    summarize: ['summary', 'notes'],
    plan: ['plan', 'roadmap', 'checklist'],
  }

  Object.entries(expectedKeywords).forEach(([task, keywords]) => {
    keywords.forEach((keyword) => {
      it(`${task} task contains keyword "${keyword}"`, () => {
        expect(TASK_KEYWORDS[task]).toContain(keyword)
      })
    })
  })

  it('all task keyword arrays contain at least 3 keywords', () => {
    for (const [task, keywords] of Object.entries(TASK_KEYWORDS)) {
      expect(keywords.length, `${task} has too few keywords`).toBeGreaterThanOrEqual(3)
    }
  })

  it('CAPABILITY_KEYWORDS is defined and non-empty', () => {
    expect(CAPABILITY_KEYWORDS).toBeDefined()
    expect(Object.keys(CAPABILITY_KEYWORDS).length).toBeGreaterThan(0)
  })

  it('no task type has duplicate keywords', () => {
    for (const [task, keywords] of Object.entries(TASK_KEYWORDS)) {
      const unique = new Set(keywords)
      expect(unique.size, `${task} has duplicate keywords`).toBe(keywords.length)
    }
  })
})
