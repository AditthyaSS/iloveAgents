// Verified stable API model endpoints - removed deprecated/future placeholders
export const MODELS = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'o1-mini', label: 'o1-mini' },
    { value: 'o3-mini', label: 'o3-mini' },
  ],
  groq: [
    { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant' },
    { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile' },
    { value: 'qwen-2.5-32b', label: 'Qwen 2.5 32B' },
    { value: 'qwen-2.5-coder-32b', label: 'Qwen 2.5 Coder 32B' },
    { value: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill Llama 70B' },
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
  groq: MODELS.groq[0].value,
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
