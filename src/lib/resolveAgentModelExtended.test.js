import { describe, it, expect } from 'vitest'
import { resolveAgentModel, MODELS, MODEL_MAP } from './resolveAgentModel'

describe('resolveAgentModel — extended scenarios', () => {
  describe('selectedModel validation', () => {
    it('uses selectedModel only when it belongs to the provider', () => {
      const agent = {}
      expect(resolveAgentModel(agent, 'openai', 'gpt-4o')).toBe('gpt-4o')
    })

    it('ignores selectedModel from wrong provider', () => {
      const agent = {}
      // claude is not an openai model
      const result = resolveAgentModel(agent, 'openai', 'claude-3-5-sonnet-20241022')
      expect(result).not.toBe('claude-3-5-sonnet-20241022')
      expect(result).toBeDefined()
    })

    it('ignores null selectedModel', () => {
      const agent = { models: { openai: 'gpt-4o-mini' } }
      expect(resolveAgentModel(agent, 'openai', null)).toBe('gpt-4o-mini')
    })

    it('ignores undefined selectedModel', () => {
      const agent = { models: { openai: 'gpt-4o-mini' } }
      expect(resolveAgentModel(agent, 'openai', undefined)).toBe('gpt-4o-mini')
    })
  })

  describe('agent.model with provider matching', () => {
    it('uses agent.model when actualProvider matches agent.provider', () => {
      const agent = { model: 'gpt-4o', provider: 'openai' }
      expect(resolveAgentModel(agent, 'openai', null)).toBe('gpt-4o')
    })

    it('does not use agent.model when provider does not match', () => {
      const agent = { model: 'gpt-4o', provider: 'openai' }
      const result = resolveAgentModel(agent, 'anthropic', null)
      expect(result).not.toBe('gpt-4o')
    })
  })

  describe('MODEL_MAP entries', () => {
    it('MODEL_MAP.openai is a valid model value in MODELS.openai', () => {
      expect(MODELS.openai.some((m) => m.value === MODEL_MAP.openai)).toBe(true)
    })

    it('MODEL_MAP.anthropic is a valid model value in MODELS.anthropic', () => {
      expect(MODELS.anthropic.some((m) => m.value === MODEL_MAP.anthropic)).toBe(true)
    })

    it('MODEL_MAP.gemini is a valid model value in MODELS.gemini', () => {
      expect(MODELS.gemini.some((m) => m.value === MODEL_MAP.gemini)).toBe(true)
    })

    it('MODEL_MAP.openrouter is a valid model value in MODELS.openrouter', () => {
      expect(MODELS.openrouter.some((m) => m.value === MODEL_MAP.openrouter)).toBe(true)
    })
  })
})
