import { describe, it, expect } from 'vitest'
import { tokenizeFreeText, normalizeScore } from './scoring.js'
import { TASK_KEYWORDS } from './rules.js'
import { GOAL_OPTIONS, RESULT_LIMIT, MIN_CONFIDENT_SCORE } from './constants.js'

describe('Recommendation engine integration', () => {
  describe('tokenization and keyword matching', () => {
    it('tokenized code query hits TASK_KEYWORDS.code', () => {
      const tokens = tokenizeFreeText('write unit tests and debug api endpoints')
      const codeKeywords = TASK_KEYWORDS.code
      const hits = tokens.filter((t) => codeKeywords.includes(t))
      expect(hits.length).toBeGreaterThan(0)
    })

    it('tokenized research query hits TASK_KEYWORDS.research', () => {
      const tokens = tokenizeFreeText('market research competitive comparison analysis')
      const researchKeywords = TASK_KEYWORDS.research
      const hits = tokens.filter((t) => researchKeywords.includes(t))
      expect(hits.length).toBeGreaterThan(0)
    })
  })

  describe('score system consistency', () => {
    it('MIN_CONFIDENT_SCORE < single highest task type weight', () => {
      const highestWeight = 30 // exactCategory weight
      expect(MIN_CONFIDENT_SCORE).toBeLessThan(highestWeight)
    })

    it('RESULT_LIMIT constrains output to at most 10 agents', () => {
      expect(RESULT_LIMIT).toBe(10)
    })

    it('normalizeScore(0, 30) returns 0', () => {
      expect(normalizeScore(0, 30)).toBe(0)
    })

    it('normalizeScore produces values in [0, 100]', () => {
      const cases = [[0, 100], [50, 100], [100, 100], [30, 30], [5, 10]]
      for (const [score, max] of cases) {
        const result = normalizeScore(score, max)
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThanOrEqual(100)
      }
    })
  })

  describe('goal options completeness', () => {
    it('all 8 goal IDs are distinct', () => {
      const ids = GOAL_OPTIONS.map((g) => g.id)
      expect(new Set(ids).size).toBe(GOAL_OPTIONS.length)
    })

    it('coding-development goal has taskTypes with code', () => {
      const codingGoal = GOAL_OPTIONS.find((g) => g.id === 'coding-development')
      expect(codingGoal?.taskTypes).toContain('code')
    })

    it('writing-content goal has write in taskTypes', () => {
      const writingGoal = GOAL_OPTIONS.find((g) => g.id === 'writing-content')
      expect(writingGoal?.taskTypes).toContain('write')
    })
  })
})
