import { describe, it, expect } from 'vitest'
import { resolveAgentModel, MODELS, MODEL_MAP } from './resolveAgentModel'

describe('resolveAgentModel', () => {
  const agent = {
    models: {
      openai: 'gpt-4o',
      anthropic: 'claude-3-5-haiku-20241022',
    },
    defaultProvider: 'openai',
  }

  it('uses selectedModel when it is valid for the provider', () => {
    const result = resolveAgentModel(agent, 'openai', 'gpt-4o-mini')
    expect(result).toBe('gpt-4o-mini')
  })

  it('rejects selectedModel that is not valid for the provider', () => {
    // claude model not valid for openai provider
    const result = resolveAgentModel(agent, 'openai', 'claude-3-5-sonnet-20241022')
    // Should fall back to agent.models or default
    expect(result).not.toBe('claude-3-5-sonnet-20241022')
  })

  it('uses agent.models[provider] when no selectedModel', () => {
    const result = resolveAgentModel(agent, 'anthropic', null)
    expect(result).toBe('claude-3-5-haiku-20241022')
  })

  it('uses agent.model when provider matches defaultProvider', () => {
    const agentWithModel = { model: 'gpt-4o', defaultProvider: 'openai' }
    const result = resolveAgentModel(agentWithModel, 'openai', null)
    expect(result).toBe('gpt-4o')
  })

  it('falls back to MODEL_MAP for unknown provider', () => {
    const result = resolveAgentModel({}, 'openai', null)
    expect(result).toBe(MODEL_MAP.openai)
  })

  it('falls back to openai default for completely unknown provider', () => {
    const result = resolveAgentModel({}, 'unknown_provider', null)
    expect(result).toBe(MODEL_MAP.openai)
  })
})

describe('MODELS structure', () => {
  it('has entries for all four providers', () => {
    expect(MODELS).toHaveProperty('openai')
    expect(MODELS).toHaveProperty('anthropic')
    expect(MODELS).toHaveProperty('gemini')
    expect(MODELS).toHaveProperty('openrouter')
  })

  it('each provider has at least one model', () => {
    for (const models of Object.values(MODELS)) {
      expect(models.length).toBeGreaterThan(0)
    }
  })

  it('each model entry has value and label', () => {
    for (const models of Object.values(MODELS)) {
      for (const m of models) {
        expect(m).toHaveProperty('value')
        expect(m).toHaveProperty('label')
      }
    }
  })
})

describe('MODEL_MAP defaults', () => {
  it('openai default is gpt-4o', () => {
    expect(MODEL_MAP.openai).toBe('gpt-4o')
  })

  it('anthropic default is Claude 3.5 Sonnet', () => {
    expect(MODEL_MAP.anthropic).toContain('claude-3-5-sonnet')
  })

  it('gemini default is gemini-2.5-flash', () => {
    expect(MODEL_MAP.gemini).toBe('gemini-2.5-flash')
  })
})
