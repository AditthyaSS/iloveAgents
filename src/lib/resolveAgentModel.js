// Verified stable API model endpoints - updated to active non-retired models
export const MODELS = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'o1-mini', label: 'o1-mini' },
    { value: 'o3-mini', label: 'o3-mini' },
  ],
  anthropic: [
    { value: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5' },
    { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
    { value: 'claude-opus-4-8', label: 'Claude Opus 4.8' },
  ],
  gemini: [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Exp)' },
  ],
  openrouter: [
    { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'anthropic/claude-sonnet-5-5', label: 'Claude Sonnet 5.5' },
    { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  ],
}

export const MODEL_MAP = {
  openai: MODELS.openai[0].value,
  anthropic: MODELS.anthropic[0].value,
  gemini: MODELS.gemini[0].value,
  openrouter: MODELS.openrouter[0].value,
}

export function resolveAgentModel(agent, actualProvider, selectedModel) {
  // Check if selectedModel is valid for the current actualProvider
  if (selectedModel && MODELS[actualProvider]?.some(m => m.value === selectedModel)) {
    return selectedModel
  }

  if (agent.models && agent.models[actualProvider]) {
    return agent.models[actualProvider]
  }

  if (agent.model && (actualProvider === agent.defaultProvider || actualProvider === agent.provider)) {
    return agent.model
  }

  return MODEL_MAP[actualProvider] || MODEL_MAP.openai
}
