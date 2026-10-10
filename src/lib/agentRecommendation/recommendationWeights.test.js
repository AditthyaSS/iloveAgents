import { describe, it, expect } from 'vitest'
import { DEFAULT_RECOMMENDATION_WEIGHTS } from './constants.js'

const EXPECTED_KEYS = [
  'exactCategory', 'goalCategory', 'taskType', 'providerExact',
  'providerAny', 'freeTextName', 'freeTextDescription',
  'experience', 'urgency', 'capabilityKeyword',
]

describe('DEFAULT_RECOMMENDATION_WEIGHTS — key presence and values', () => {
  EXPECTED_KEYS.forEach((key) => {
    it(`has key: ${key}`, () => {
      expect(DEFAULT_RECOMMENDATION_WEIGHTS).toHaveProperty(key)
    })

    it(`${key} is a positive integer`, () => {
      const value = DEFAULT_RECOMMENDATION_WEIGHTS[key]
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThan(0)
    })
  })

  it('exactCategory (30) > goalCategory (20)', () => {
    expect(DEFAULT_RECOMMENDATION_WEIGHTS.exactCategory).toBeGreaterThan(
      DEFAULT_RECOMMENDATION_WEIGHTS.goalCategory
    )
  })

  it('taskType (18) > providerExact (8)', () => {
    expect(DEFAULT_RECOMMENDATION_WEIGHTS.taskType).toBeGreaterThan(
      DEFAULT_RECOMMENDATION_WEIGHTS.providerExact
    )
  })

  it('freeTextName (10) > freeTextDescription (5)', () => {
    expect(DEFAULT_RECOMMENDATION_WEIGHTS.freeTextName).toBeGreaterThan(
      DEFAULT_RECOMMENDATION_WEIGHTS.freeTextDescription
    )
  })

  it('providerExact > providerAny', () => {
    expect(DEFAULT_RECOMMENDATION_WEIGHTS.providerExact).toBeGreaterThan(
      DEFAULT_RECOMMENDATION_WEIGHTS.providerAny
    )
  })
})
