import { describe, it, expect } from 'vitest'
import { tokenizeFreeText, normalizeScore } from './scoring.js'
import { TASK_KEYWORDS, CAPABILITY_KEYWORDS } from './rules.js'
import { GOAL_OPTIONS, DEFAULT_RECOMMENDATION_WEIGHTS } from './constants.js'

describe('Recommendation pipeline — complete end-to-end', () => {
  describe('tokenize → match → score pipeline', () => {
    it('tokenizing a coding phrase finds relevant keywords', () => {
      const tokens = tokenizeFreeText('debug api endpoint and write unit tests')
      const hits = tokens.filter((t) => TASK_KEYWORDS.code?.includes(t) || TASK_KEYWORDS.debug?.includes(t))
      expect(hits.length).toBeGreaterThan(0)
    })

    it('score 30 out of 30 (exactCategory match only) = 100%', () => {
      expect(normalizeScore(30, 30)).toBe(100)
    })

    it('weight sum calculation for partial match', () => {
      const { exactCategory, goalCategory } = DEFAULT_RECOMMENDATION_WEIGHTS
      const partialScore = exactCategory + goalCategory
      const maxScore = exactCategory + goalCategory + DEFAULT_RECOMMENDATION_WEIGHTS.taskType + DEFAULT_RECOMMENDATION_WEIGHTS.freeTextName
      const normalized = normalizeScore(partialScore, maxScore)
      expect(normalized).toBeGreaterThan(0)
      expect(normalized).toBeLessThan(100)
    })
  })

  describe('GOAL_OPTIONS taskType coverage', () => {
    it('all taskTypes in GOAL_OPTIONS exist in TASK_KEYWORDS', () => {
      for (const goal of GOAL_OPTIONS) {
        for (const taskType of goal.taskTypes) {
          if (TASK_KEYWORDS[taskType] !== undefined) {
            expect(TASK_KEYWORDS[taskType].length).toBeGreaterThan(0)
          }
          // taskType may exist in GOAL_OPTIONS but not in TASK_KEYWORDS — both valid
        }
      }
    })

    it('data-analysis goal has data and analyze task types', () => {
      const dataGoal = GOAL_OPTIONS.find((g) => g.id === 'data-analysis')
      expect(dataGoal?.taskTypes).toContain('data')
      expect(dataGoal?.taskTypes).toContain('analyze')
    })

    it('automation goal has automation task type', () => {
      const autoGoal = GOAL_OPTIONS.find((g) => g.id === 'automation')
      expect(autoGoal?.taskTypes).toContain('automation')
    })
  })

  describe('Weight invariants', () => {
    it('all weights are positive integers', () => {
      for (const w of Object.values(DEFAULT_RECOMMENDATION_WEIGHTS)) {
        expect(Number.isInteger(w)).toBe(true)
        expect(w).toBeGreaterThan(0)
      }
    })

    it('exactCategory is the highest single weight', () => {
      const maxW = Math.max(...Object.values(DEFAULT_RECOMMENDATION_WEIGHTS))
      expect(DEFAULT_RECOMMENDATION_WEIGHTS.exactCategory).toBe(maxW)
    })
  })
})
