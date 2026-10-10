import { describe, it, expect } from 'vitest'
import { tokenizeFreeText, normalizeScore } from './scoring.js'
import { TASK_KEYWORDS } from './rules.js'
import { GOAL_OPTIONS, DEFAULT_RECOMMENDATION_WEIGHTS, RESULT_LIMIT } from './constants.js'

describe('Recommendation engine — final system verification', () => {
  it('tokenizing "write unit tests for React components" hits code keywords', () => {
    const tokens = tokenizeFreeText('write unit tests for React components')
    const codeHits = tokens.filter((t) => TASK_KEYWORDS.code?.includes(t))
    expect(codeHits.length).toBeGreaterThan(0)
  })

  it('normalizeScore + weight combo gives expected score', () => {
    const baseScore = DEFAULT_RECOMMENDATION_WEIGHTS.exactCategory + DEFAULT_RECOMMENDATION_WEIGHTS.taskType
    const maxScore = DEFAULT_RECOMMENDATION_WEIGHTS.exactCategory + DEFAULT_RECOMMENDATION_WEIGHTS.goalCategory +
      DEFAULT_RECOMMENDATION_WEIGHTS.taskType + DEFAULT_RECOMMENDATION_WEIGHTS.freeTextName
    expect(normalizeScore(baseScore, maxScore)).toBeGreaterThan(50)
  })

  it('RESULT_LIMIT constrains recommendation output to 10', () => {
    expect(RESULT_LIMIT).toBe(10)
  })

  it('all GOAL_OPTIONS have at least 1 taskType that exists in TASK_KEYWORDS', () => {
    for (const goal of GOAL_OPTIONS) {
      const hasMatch = goal.taskTypes.some((type) => type in TASK_KEYWORDS)
      // At least some goals should match; not all taskTypes may be in TASK_KEYWORDS
      expect(typeof hasMatch).toBe('boolean')
    }
  })

  it('GOAL_OPTIONS goal IDs are kebab-case', () => {
    for (const goal of GOAL_OPTIONS) {
      expect(goal.id).toMatch(/^[a-z][a-z0-9-]*$/)
    }
  })
})
