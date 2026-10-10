import { MODEL_PRICING } from './modelPricing'

export function countWords(text) {
  if (!text || typeof text !== 'string') return 0
  const parts = text.trim().split(/\s+/).filter(Boolean)
  return parts.length
}

export function estimateTokens(text) {
  if (!text || typeof text !== 'string') return 0
  return Math.max(1, Math.round(text.length / 4))
}

export function estimateCost(model, outputText) {
  const entry = MODEL_PRICING[model]
  if (!entry) return null
  const tokens = estimateTokens(outputText)
  const cost = (tokens / 1000000) * (entry.outputCostPer1M || 0)
  return cost
}

export function buildBattleStats(content, durationMs, model) {
  const text = typeof content === 'string' ? content : ''
  const words = countWords(text)
  const chars = text.length
  const tokens = text ? estimateTokens(text) : 0
  const seconds = typeof durationMs === 'number' ? durationMs / 1000 : null
  const cost = text && model ? estimateCost(model, text) : null
  return { words, chars, tokens, seconds, cost }
}

export function formatCost(cost) {
  if (cost === null || cost === undefined) return 'n/a'
  if (cost < 0.01) return `$${cost.toFixed(4)}`
  return `$${cost.toFixed(3)}`
}
