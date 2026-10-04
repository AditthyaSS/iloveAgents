import { describe, it, expect } from 'vitest'
import { tokenizeFreeText, normalizeScore } from './scoring.js'
import { TASK_KEYWORDS, CAPABILITY_KEYWORDS } from './rules.js'
import { DEFAULT_RECOMMENDATION_WEIGHTS, GOAL_OPTIONS } from './constants.js'

describe('Scoring system — final end-to-end', () => {
  describe('Full recommendation cycle simulation', () => {
    it('coding agent gets relevant tokens', () => {
      const tokens = tokenizeFreeText('build REST API with Node.js and Express')
      const codeHits = tokens.filter((t) => TASK_KEYWORDS.code?.includes(t) || TASK_KEYWORDS.technical?.includes(t))
      expect(codeHits.length).toBeGreaterThan(0)
    })

    it('writing agent gets relevant tokens', () => {
      const tokens = tokenizeFreeText('write product descriptions and marketing copy')
      const writeHits = tokens.filter((t) =>
        TASK_KEYWORDS.write?.includes(t) || TASK_KEYWORDS.generate?.includes(t)
      )
      expect(writeHits.length).toBeGreaterThan(0)
    })

    it('research query gets relevant tokens', () => {
      const tokens = tokenizeFreeText('competitive research analysis market comparison')
      const researchHits = tokens.filter((t) => TASK_KEYWORDS.research?.includes(t))
      expect(researchHits.length).toBeGreaterThan(0)
    })
  })

  describe('Score normalization consistency', () => {
    it('normalizeScore always returns integer', () => {
      const testInputs = [[0, 100], [50, 100], [33, 99], [100, 100], [1, 3]]
      for (const [score, max] of testInputs) {
        expect(Number.isInteger(normalizeScore(score, max))).toBe(true)
      }
    })

    it('normalizeScore(x, x) = 100 for any positive x', () => {
      [10, 30, 50, 100, 150].forEach((x) => {
        expect(normalizeScore(x, x)).toBe(100)
      })
    })
  })

  describe('Goal IDs are valid routing keys', () => {
    it('all goal IDs can be used as object keys', () => {
      const goalMap = {}
      for (const goal of GOAL_OPTIONS) {
        goalMap[goal.id] = goal.label
      }
      expect(Object.keys(goalMap)).toHaveLength(GOAL_OPTIONS.length)
    })
  })
})
