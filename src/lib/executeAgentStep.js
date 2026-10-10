import { runAgent } from './llmAdapter'
import { recordAnalyticsRun } from './useAnalytics'

export function normalizeStepError(err, { provider, model } = {}) {
  if (!err || typeof err !== 'object') return new Error('Step failed with an unknown error.')
  if (err.name === 'AbortError') return err
  const message = err.message || err.detail || 'Step failed.'
  const context = [provider, model].filter(Boolean).join(' / ')
  const normalized = new Error(context ? `${message} (${context})` : message)
  normalized.cause = err
  if (err.type) normalized.type = err.type
  return normalized
}

export async function executeAgentStep({
  agent,
  provider,
  model,
  apiKey,
  systemPrompt,
  userMessage,
  signal,
  analytics = true,
}) {
  const result = await runAgent(
    { provider, model, apiKey, systemPrompt, userMessage },
    { signal }
  )
  if (analytics && agent?.id) {
    recordAnalyticsRun({
      agentId: agent.id,
      agentName: agent.name,
      category: agent.category,
      provider,
      model,
      duration: result.duration,
    })
  }
  return result
}
