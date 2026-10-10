import { describe, it, expect } from 'vitest'
import { MODEL_MAP, MODELS, resolveAgentModel } from './resolveAgentModel'

describe('MODEL_MAP — default model selection', () => {
  it('MODEL_MAP has all 4 providers', () => {
    const providers = ['openai', 'anthropic', 'gemini', 'openrouter']
    for (const provider of providers) {
      expect(MODEL_MAP).toHaveProperty(provider)
    }
  })

  it('each MODEL_MAP entry matches an existing model in MODELS', () => {
    for (const [provider, defaultModel] of Object.entries(MODEL_MAP)) {
      const providerModels = MODELS[provider] || []
      const found = providerModels.some((m) => m.value === defaultModel)
      expect(found).toBe(true)
    }
  })

  it('all MODEL_MAP values are non-empty strings', () => {
    for (const value of Object.values(MODEL_MAP)) {
      expect(typeof value).toBe('string')
      expect(value.length).toBeGreaterThan(0)
    }
  })

  it('MODEL_MAP.openai is the first model in MODELS.openai', () => {
    expect(MODEL_MAP.openai).toBe(MODELS.openai[0].value)
  })

  it('MODEL_MAP.anthropic is the first model in MODELS.anthropic', () => {
    expect(MODEL_MAP.anthropic).toBe(MODELS.anthropic[0].value)
  })

  it('MODEL_MAP.gemini is the first model in MODELS.gemini', () => {
    expect(MODEL_MAP.gemini).toBe(MODELS.gemini[0].value)
  })
})

describe('resolveAgentModel — complete fallback chain', () => {
  it('empty agent with unknown provider falls back to openai default', () => {
    const result = resolveAgentModel({}, 'unknown_provider_xyz', null)
    expect(result).toBe(MODEL_MAP.openai)
  })

  it('empty agent with known provider returns that provider default', () => {
    for (const provider of ['openai', 'anthropic', 'gemini']) {
      const result = resolveAgentModel({}, provider, null)
      expect(result).toBe(MODEL_MAP[provider])
    }
  })

  it('selected model is preferred over agent.models over MODEL_MAP', () => {
    const agent = { models: { openai: 'gpt-4o' } }
    const result = resolveAgentModel(agent, 'openai', 'gpt-4o-mini')
    expect(result).toBe('gpt-4o-mini')
  })
})
