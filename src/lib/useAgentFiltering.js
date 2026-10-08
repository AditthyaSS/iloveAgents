import { useMemo } from 'react'

const PROVIDER_LABELS = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Gemini',
  openrouter: 'OpenRouter',
  any: 'Any Provider',
}

export function buildAgentSearchIndex(agents) {
  const index = new Map()
  for (const agent of agents || []) {
    if (!agent || agent.id == null) continue
    const provider = agent.provider || 'any'
    index.set(
      agent.id,
      [
        agent.name,
        agent.description,
        agent.category,
        agent.id,
        agent.model,
        PROVIDER_LABELS[provider],
        provider,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
    )
  }
  return index
}

export function filterAgents(
  agents,
  { query = '', category = null, provider = null, collectionId = null, defaultCollectionId = null, getCollectionId = null, searchIndex = null } = {}
) {
  const q = (query || '').trim().toLowerCase()
  return (agents || []).filter((agent) => {
    if (!agent) return false
    if (category && agent.category !== category) return false
    const agentProvider = agent.provider || 'any'
    if (provider && agentProvider !== provider) return false
    if (
      collectionId != null &&
      defaultCollectionId != null &&
      collectionId !== defaultCollectionId
    ) {
      if (typeof getCollectionId !== 'function' || getCollectionId(agent.id) !== collectionId) {
        return false
      }
    }
    if (!q) return true
    const haystack = searchIndex
      ? searchIndex.get(agent.id) || ''
      : JSON.stringify([agent.name, agent.description, agent.category, agent.id]).toLowerCase()
    return haystack.includes(q)
  })
}

export function useAgentFiltering(agents, options = {}) {
  const searchIndex = useMemo(() => buildAgentSearchIndex(agents), [agents])
  return useMemo(
    () => filterAgents(agents, { ...options, searchIndex }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agents, searchIndex, options.query, options.category, options.provider, options.collectionId]
  )
}
