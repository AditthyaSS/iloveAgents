import { describe, it, expect } from 'vitest'
import { resolveAgentModel, MODELS, MODEL_MAP } from './resolveAgentModel'

describe('resolveAgentModel — final complete scenarios', () => {
  describe('Priority chain: selectedModel > agent.models > agent.model > MODEL_MAP', () => {
    const AGENT_WITH_ALL = {
      models: { openai: 'gpt-4o', anthropic: 'claude-3-5-sonnet-20241022' },
      model: 'gemini-2.5-flash',
      defaultProvider: 'gemini',
      provider: 'gemini',
    }

    it('1. selectedModel wins when valid for provider', () => {
      expect(resolveAgentModel(AGENT_WITH_ALL, 'openai', 'gpt-4o-mini')).toBe('gpt-4o-mini')
    })

    it('2. agent.models wins when selectedModel invalid', () => {
      expect(resolveAgentModel(AGENT_WITH_ALL, 'openai', null)).toBe('gpt-4o')
    })

    it('3. agent.model wins when no agent.models for provider', () => {
      expect(resolveAgentModel(AGENT_WITH_ALL, 'gemini', null)).toBe('gemini-2.5-flash')
    })

    it('4. MODEL_MAP fallback when nothing else matches', () => {
      expect(resolveAgentModel({}, 'anthropic', null)).toBe(MODEL_MAP.anthropic)
    })
  })

  describe('Cross-provider isolation', () => {
    it('openai model not accepted for anthropic provider', () => {
      const result = resolveAgentModel({}, 'anthropic', 'gpt-4o')
      expect(result).not.toBe('gpt-4o')
    })

    it('anthropic model not accepted for openai provider', () => {
      const result = resolveAgentModel({}, 'openai', 'claude-3-5-sonnet-20241022')
      expect(result).not.toBe('claude-3-5-sonnet-20241022')
    })
  })

  describe('All MODEL_MAP defaults are first in MODELS', () => {
    for (const provider of ['openai', 'anthropic', 'gemini']) {
      it(`${provider} default = first in MODELS.${provider}`, () => {
        expect(MODEL_MAP[provider]).toBe(MODELS[provider][0].value)
      })
    }
  })
})
