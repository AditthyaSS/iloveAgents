import { describe, it, expect } from 'vitest'
import { resolveAgentModel, MODELS, MODEL_MAP } from './resolveAgentModel'

describe('MODELS', () => {
  it('should have entries for all four providers', () => {
    expect(MODELS).toHaveProperty('openai')
    expect(MODELS).toHaveProperty('anthropic')
    expect(MODELS).toHaveProperty('gemini')
    expect(MODELS).toHaveProperty('openrouter')
  })

  it('each provider should have at least one model', () => {
    Object.values(MODELS).forEach((models) => {
      expect(models.length).toBeGreaterThan(0)
      models.forEach((m) => {
        expect(m).toHaveProperty('value')
        expect(m).toHaveProperty('label')
      })
    })
  })
})

describe('MODEL_MAP', () => {
  it('should map each provider to its first model', () => {
    expect(MODEL_MAP.openai).toBe(MODELS.openai[0].value)
    expect(MODEL_MAP.anthropic).toBe(MODELS.anthropic[0].value)
    expect(MODEL_MAP.gemini).toBe(MODELS.gemini[0].value)
    expect(MODEL_MAP.openrouter).toBe(MODELS.openrouter[0].value)
  })
})

describe('resolveAgentModel', () => {
  const baseAgent = {
    provider: 'any',
    defaultProvider: 'openai',
    model: 'gpt-4o',
  }

  it('should return selectedModel if valid for the provider', () => {
    const result = resolveAgentModel(baseAgent, 'openai', 'gpt-4o-mini')
    expect(result).toBe('gpt-4o-mini')
  })

  it('should ignore selectedModel if invalid for the provider', () => {
    const result = resolveAgentModel(baseAgent, 'anthropic', 'gpt-4o-mini')
    expect(result).not.toBe('gpt-4o-mini')
  })

  it('should use agent.models[provider] if available', () => {
    const agent = {
      ...baseAgent,
      models: { anthropic: 'claude-3-opus-20240229' },
    }
    const result = resolveAgentModel(agent, 'anthropic', null)
    expect(result).toBe('claude-3-opus-20240229')
  })

  it('should use agent.model if provider matches defaultProvider', () => {
    const result = resolveAgentModel(baseAgent, 'openai', null)
    expect(result).toBe('gpt-4o')
  })

  it('should fall back to MODEL_MAP default for unknown provider match', () => {
    const agent = { provider: 'any', defaultProvider: 'openai', model: 'gpt-4o' }
    const result = resolveAgentModel(agent, 'gemini', null)
    expect(result).toBe(MODEL_MAP.gemini)
  })

  it('should fall back to provider default when agent.models[provider] is unlisted', () => {
    const agent = {
      ...baseAgent,
      models: { anthropic: 'unlisted-claude-model-123' },
    }
    const result = resolveAgentModel(agent, 'anthropic', null)
    expect(result).toBe(MODEL_MAP.anthropic)
  })

  it('should fall back to provider default when agent.model is unlisted for provider match', () => {
    const agent = {
      provider: 'openai',
      model: 'unlisted-openai-model-456',
    }
    const result = resolveAgentModel(agent, 'openai', null)
    expect(result).toBe(MODEL_MAP.openai)
  })

  it('should fall back to provider default when agent.model is unlisted for defaultProvider match', () => {
    const agent = {
      provider: 'any',
      defaultProvider: 'openai',
      model: 'unlisted-openai-model-789',
    }
    const result = resolveAgentModel(agent, 'openai', null)
    expect(result).toBe(MODEL_MAP.openai)
  })

  it('should handle undefined or null agent gracefully', () => {
    const result = resolveAgentModel(null, 'openai', null)
    expect(result).toBe(MODEL_MAP.openai)
  })

  it('should fall back to openai default for completely unknown provider', () => {
    const agent = { provider: 'any' }
    const result = resolveAgentModel(agent, 'unknown-provider', null)
    expect(result).toBe(MODEL_MAP.openai)
  })
})
