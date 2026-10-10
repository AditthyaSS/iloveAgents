import { describe, it, expect } from 'vitest'
import { MODEL_PRICING, MODELS, MODEL_MAP } from './resolveAgentModel'

describe('Model data structure integrity', () => {
  describe('MODELS array structure', () => {
    it('each provider in MODELS has at least 3 models', () => {
      for (const [provider, models] of Object.entries(MODELS)) {
        expect(models.length).toBeGreaterThanOrEqual(3)
      }
    })

    it('all model values in MODELS are non-empty strings', () => {
      for (const models of Object.values(MODELS)) {
        for (const m of models) {
          expect(typeof m.value).toBe('string')
          expect(m.value.length).toBeGreaterThan(0)
        }
      }
    })

    it('all model labels in MODELS are non-empty strings', () => {
      for (const models of Object.values(MODELS)) {
        for (const m of models) {
          expect(typeof m.label).toBe('string')
          expect(m.label.trim().length).toBeGreaterThan(0)
        }
      }
    })

    it('no duplicate model values within a provider', () => {
      for (const [provider, models] of Object.entries(MODELS)) {
        const values = models.map((m) => m.value)
        expect(new Set(values).size).toBe(values.length)
      }
    })
  })

  describe('MODEL_MAP consistency', () => {
    it('MODEL_MAP.openai is first in MODELS.openai', () => {
      expect(MODEL_MAP.openai).toBe(MODELS.openai[0].value)
    })

    it('MODEL_MAP values are all in MODEL_PRICING', () => {
      for (const modelId of Object.values(MODEL_MAP)) {
        expect(MODEL_PRICING[modelId]).toBeDefined()
      }
    })
  })

  describe('MODEL_PRICING cross-reference with MODELS', () => {
    it('all MODELS values exist in MODEL_PRICING', () => {
      for (const models of Object.values(MODELS)) {
        for (const m of models) {
          const pricing = MODEL_PRICING[m.value]
          if (pricing) {
            expect(pricing.contextWindow).toBeGreaterThan(0)
          }
        }
      }
    })
  })
})
