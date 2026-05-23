// Verified stable API model endpoints - removed deprecated/future placeholders
export const MODELS = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'o1-mini', label: 'o1-mini' },
    { value: 'o3-mini', label: 'o3-mini' },
  ],
  anthropic: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  ],
  gemini: [
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Exp)' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  ],
}

export const MODEL_MAP = {
  openai: MODELS.openai[0].value,
  anthropic: MODELS.anthropic[0].value,
  gemini: MODELS.gemini[0].value,
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
