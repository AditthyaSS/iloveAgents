import { describe, it, expect } from 'vitest'
import { tokenizeFreeText } from './scoring.js'
import { TASK_KEYWORDS } from './rules.js'

describe('Search query → keyword matching engine', () => {
  const queries = {
    coding: 'write unit tests and debug api endpoints for backend services',
    writing: 'generate blog posts and marketing copy for my product',
    research: 'market research and competitive analysis for startup strategy',
    data: 'analyze csv data and create pandas dataframe from sql queries',
    automation: 'automate workflow pipeline deployment and ci/cd processes',
  }

  describe('coding query', () => {
    const tokens = tokenizeFreeText(queries.coding)
    it('hits code keywords', () => {
      const hits = tokens.filter((t) => TASK_KEYWORDS.code?.includes(t))
      expect(hits.length).toBeGreaterThan(0)
    })
    it('hits debug keywords', () => {
      const hits = tokens.filter((t) => TASK_KEYWORDS.debug?.includes(t))
      expect(hits.length).toBeGreaterThan(0)
    })
  })

  describe('writing query', () => {
    const tokens = tokenizeFreeText(queries.writing)
    it('hits write keywords', () => {
      const hits = tokens.filter((t) => TASK_KEYWORDS.write?.includes(t))
      expect(hits.length).toBeGreaterThan(0)
    })
    it('hits generate keywords', () => {
      const hits = tokens.filter((t) => TASK_KEYWORDS.generate?.includes(t))
      expect(hits.length).toBeGreaterThan(0)
    })
  })

  describe('data query', () => {
    const tokens = tokenizeFreeText(queries.data)
    it('hits data or analyze keywords', () => {
      const allKeywords = [...(TASK_KEYWORDS.data || []), ...(TASK_KEYWORDS.analyze || [])]
      const hits = tokens.filter((t) => allKeywords.includes(t))
      expect(hits.length).toBeGreaterThan(0)
    })
  })

  describe('automation query', () => {
    const tokens = tokenizeFreeText(queries.automation)
    it('hits automation or technical keywords', () => {
      const allKeywords = [...(TASK_KEYWORDS.automation || []), ...(TASK_KEYWORDS.technical || [])]
      const hits = tokens.filter((t) => allKeywords.includes(t))
      expect(hits.length).toBeGreaterThan(0)
    })
  })
})
