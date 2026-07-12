export const MODEL_PRICING = {
  'gpt-4o': {
    provider: 'openai',
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.00,
    contextWindow: 128000,
  },
  'gpt-4o-mini': {
    provider: 'openai',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    contextWindow: 128000,
  },
  'o1-mini': {
    provider: 'openai',
    inputCostPer1M: 1.10,
    outputCostPer1M: 4.40,
    contextWindow: 128000,
  },
  'o3-mini': {
    provider: 'openai',
    inputCostPer1M: 1.10,
    outputCostPer1M: 4.40,
    contextWindow: 200000,
  },
  'claude-3-5-sonnet-20241022': {
    provider: 'anthropic',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    contextWindow: 200000,
  },
  'claude-3-5-haiku-20241022': {
    provider: 'anthropic',
    inputCostPer1M: 0.80,
    outputCostPer1M: 4.00,
    contextWindow: 200000,
  },
  'claude-3-opus-20240229': {
    provider: 'anthropic',
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
    contextWindow: 200000,
  },
  'gemini-1.5-flash': {
    provider: 'gemini',
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    contextWindow: 1000000,
  },
  'gemini-1.5-pro': {
    provider: 'gemini',
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.00,
    contextWindow: 2000000,
  },
  'gemini-2.0-flash-exp': {
    provider: 'gemini',
    inputCostPer1M: 0.10,
    outputCostPer1M: 0.40,
    contextWindow: 1000000,
  },
  'gemini-2.5-flash': {
    provider: 'gemini',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    contextWindow: 1000000,
  },
  'openai/gpt-4o-mini': {
    provider: 'openrouter',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    contextWindow: 128000,
  },
  'anthropic/claude-3.5-sonnet': {
    provider: 'openrouter',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    contextWindow: 200000,
  },
  'google/gemini-2.5-flash': {
    provider: 'openrouter',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    contextWindow: 1000000,
  },
}

export function getPricing(modelId) {
  return MODEL_PRICING[modelId] || null
}

export function estimateInputCost(modelId, inputTokens) {
  const pricing = getPricing(modelId)
  if (!pricing) return null
  return (inputTokens / 1_000_000) * pricing.inputCostPer1M
}

export function estimateOutputCost(modelId, outputTokens) {
  const pricing = getPricing(modelId)
  if (!pricing) return null
  return (outputTokens / 1_000_000) * pricing.outputCostPer1M
}

export function getContextWindow(modelId) {
  const pricing = getPricing(modelId)
  return pricing ? pricing.contextWindow : 128000
}
