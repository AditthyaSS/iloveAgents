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
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Exp)' },
  ],
  openrouter: [
    { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
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
  const isListed = (modelId) =>
    Boolean(modelId && MODELS[actualProvider]?.some((m) => m.value === modelId))

  // 1. User-selected model wins if listed for the actual provider
  if (isListed(selectedModel)) {
    return selectedModel
  }

  // 2. Agent-specific provider model override if listed
  if (agent?.models && isListed(agent.models[actualProvider])) {
    return agent.models[actualProvider]
  }

  // 3. Agent default model if provider matches and is listed
  if (
    agent?.model &&
    (actualProvider === agent.defaultProvider || actualProvider === agent.provider) &&
    isListed(agent.model)
  ) {
    return agent.model
  }

  // 4. Provider default fallback
  return MODEL_MAP[actualProvider] || MODEL_MAP.openai
}
