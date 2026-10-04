import { describe, it, expect } from 'vitest'
import { GOAL_OPTIONS, EXTRA_PREFERENCE_OPTIONS, DEFAULT_RECOMMENDATION_WEIGHTS, RESULT_LIMIT, MIN_CONFIDENT_SCORE } from './constants.js'
import { TASK_KEYWORDS, CAPABILITY_KEYWORDS } from './rules.js'

describe('Recommendation engine — data integrity checks', () => {
  describe('GOAL_OPTIONS integrity', () => {
    it('has exactly 8 goals', () => {
      expect(GOAL_OPTIONS).toHaveLength(8)
    })

    it('goal IDs match expected set', () => {
      const expectedIds = [
        'coding-development', 'research-analysis', 'writing-content',
        'automation', 'data-analysis', 'image-generation', 'learning',
        'business-productivity',
      ]
      const actualIds = GOAL_OPTIONS.map((g) => g.id).sort()
      expect(actualIds).toEqual(expectedIds.sort())
    })

    it('each goal has an icon property', () => {
      for (const goal of GOAL_OPTIONS) {
        expect(goal).toHaveProperty('icon')
        expect(goal.icon).toBeDefined()
      }
    })
  })

  describe('TASK_KEYWORDS structure', () => {
    it('has at least 15 task types', () => {
      expect(Object.keys(TASK_KEYWORDS).length).toBeGreaterThanOrEqual(15)
    })

    it('code task has at least 5 keywords', () => {
      expect(TASK_KEYWORDS.code.length).toBeGreaterThanOrEqual(5)
    })

    it('write task has at least 5 keywords', () => {
      expect(TASK_KEYWORDS.write.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('Constants sanity checks', () => {
    it('RESULT_LIMIT is 10', () => {
      expect(RESULT_LIMIT).toBe(10)
    })

    it('MIN_CONFIDENT_SCORE is 12', () => {
      expect(MIN_CONFIDENT_SCORE).toBe(12)
    })

    it('exactCategory weight is 30', () => {
      expect(DEFAULT_RECOMMENDATION_WEIGHTS.exactCategory).toBe(30)
    })

    it('goalCategory weight is 20', () => {
      expect(DEFAULT_RECOMMENDATION_WEIGHTS.goalCategory).toBe(20)
    })
  })
})
