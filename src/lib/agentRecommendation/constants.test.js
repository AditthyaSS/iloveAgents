import { describe, it, expect } from 'vitest'
import {
  RESULT_LIMIT,
  MIN_CONFIDENT_SCORE,
  DEFAULT_RECOMMENDATION_WEIGHTS,
  GOAL_OPTIONS,
  EXPERIENCE_OPTIONS,
  PROVIDER_OPTIONS,
  BUDGET_OPTIONS,
  EXTRA_PREFERENCE_OPTIONS,
  STOP_WORDS,
} from './constants.js'

describe('RESULT_LIMIT and MIN_CONFIDENT_SCORE', () => {
  it('RESULT_LIMIT is a positive integer', () => {
    expect(Number.isInteger(RESULT_LIMIT)).toBe(true)
    expect(RESULT_LIMIT).toBeGreaterThan(0)
  })

  it('MIN_CONFIDENT_SCORE is a positive number', () => {
    expect(typeof MIN_CONFIDENT_SCORE).toBe('number')
    expect(MIN_CONFIDENT_SCORE).toBeGreaterThan(0)
  })
})

describe('DEFAULT_RECOMMENDATION_WEIGHTS', () => {
  it('all weight values are positive numbers', () => {
    for (const [key, value] of Object.entries(DEFAULT_RECOMMENDATION_WEIGHTS)) {
      expect(typeof value, `${key} should be a number`).toBe('number')
      expect(value, `${key} should be > 0`).toBeGreaterThan(0)
    }
  })

  it('contains expected weight keys', () => {
    const expected = ['exactCategory', 'goalCategory', 'taskType', 'providerExact']
    for (const key of expected) {
      expect(Object.keys(DEFAULT_RECOMMENDATION_WEIGHTS)).toContain(key)
    }
  })

  it('exactCategory weight is the highest single weight', () => {
    const max = Math.max(...Object.values(DEFAULT_RECOMMENDATION_WEIGHTS))
    expect(DEFAULT_RECOMMENDATION_WEIGHTS.exactCategory).toBe(max)
  })
})

describe('GOAL_OPTIONS', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(GOAL_OPTIONS)).toBe(true)
    expect(GOAL_OPTIONS.length).toBeGreaterThan(0)
  })

  it('each option has id, label, description, categories, and taskTypes', () => {
    GOAL_OPTIONS.forEach(opt => {
      expect(typeof opt.id, `${opt.id} id`).toBe('string')
      expect(typeof opt.label, `${opt.id} label`).toBe('string')
      expect(typeof opt.description, `${opt.id} description`).toBe('string')
      expect(Array.isArray(opt.categories), `${opt.id} categories`).toBe(true)
      expect(Array.isArray(opt.taskTypes), `${opt.id} taskTypes`).toBe(true)
      expect(opt.categories.length, `${opt.id} has ≥1 category`).toBeGreaterThan(0)
      expect(opt.taskTypes.length, `${opt.id} has ≥1 taskType`).toBeGreaterThan(0)
    })
  })

  it('all option ids are unique', () => {
    const ids = GOAL_OPTIONS.map(o => o.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('contains "coding-development" and "research-analysis"', () => {
    const ids = GOAL_OPTIONS.map(o => o.id)
    expect(ids).toContain('coding-development')
    expect(ids).toContain('research-analysis')
  })
})

describe('EXPERIENCE_OPTIONS', () => {
  it('is a non-empty array with id, label, description', () => {
    expect(Array.isArray(EXPERIENCE_OPTIONS)).toBe(true)
    EXPERIENCE_OPTIONS.forEach(opt => {
      expect(typeof opt.id).toBe('string')
      expect(typeof opt.label).toBe('string')
      expect(typeof opt.description).toBe('string')
    })
  })

  it('contains beginner and advanced options', () => {
    const ids = EXPERIENCE_OPTIONS.map(o => o.id)
    expect(ids).toContain('beginner')
    expect(ids).toContain('advanced')
  })
})

describe('PROVIDER_OPTIONS', () => {
  it('includes "any" provider option', () => {
    const ids = PROVIDER_OPTIONS.map(o => o.id)
    expect(ids).toContain('any')
  })

  it('each option has id, label, description', () => {
    PROVIDER_OPTIONS.forEach(opt => {
      expect(typeof opt.id).toBe('string')
      expect(typeof opt.label).toBe('string')
      expect(typeof opt.description).toBe('string')
    })
  })
})

describe('BUDGET_OPTIONS', () => {
  it('contains "fast", "balanced", "capable", and "any"', () => {
    const ids = BUDGET_OPTIONS.map(o => o.id)
    expect(ids).toContain('fast')
    expect(ids).toContain('balanced')
    expect(ids).toContain('capable')
    expect(ids).toContain('any')
  })
})

describe('EXTRA_PREFERENCE_OPTIONS', () => {
  it('each option has id, label, and capability', () => {
    EXTRA_PREFERENCE_OPTIONS.forEach(opt => {
      expect(typeof opt.id).toBe('string')
      expect(typeof opt.label).toBe('string')
      expect(typeof opt.capability).toBe('string')
    })
  })

  it('contains "tool-calling" and "structured-output"', () => {
    const ids = EXTRA_PREFERENCE_OPTIONS.map(o => o.id)
    expect(ids).toContain('tool-calling')
    expect(ids).toContain('structured-output')
  })

  it('all capability values are non-empty strings', () => {
    EXTRA_PREFERENCE_OPTIONS.forEach(opt => {
      expect(opt.capability.length).toBeGreaterThan(0)
    })
  })
})

describe('STOP_WORDS', () => {
  it('is a Set', () => {
    expect(STOP_WORDS instanceof Set).toBe(true)
  })

  it('contains common English stop words', () => {
    expect(STOP_WORDS.has('the')).toBe(true)
    expect(STOP_WORDS.has('and')).toBe(true)
    expect(STOP_WORDS.has('for')).toBe(true)
  })

  it('contains agent-specific stop words', () => {
    expect(STOP_WORDS.has('agent')).toBe(true)
    expect(STOP_WORDS.has('agents')).toBe(true)
  })

  it('has at least 8 entries', () => {
    expect(STOP_WORDS.size).toBeGreaterThanOrEqual(8)
  })
})
