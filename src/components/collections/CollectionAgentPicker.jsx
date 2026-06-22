import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { MAX_AGENTS_PER_COLLECTION } from '../../lib/useCollections'

function getMutationError(result, fallback) {
  if (result === false) return fallback
  if (result && typeof result === 'object' && result.ok === false) {
    return result.error || fallback
  }

  return ''
}

export default function CollectionAgentPicker({
  collection,
  agents,
  onAddAgent,
  onRemoveAgent,
  maxAgents = MAX_AGENTS_PER_COLLECTION,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [feedback, setFeedback] = useState('')
  const selectedIds = useMemo(() => new Set((collection?.agentIds || []).filter(Boolean)), [collection])
  const selectedCount = selectedIds.size
  const isFull = selectedCount >= maxAgents

  const filteredAgents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return agents

    return agents.filter((agent) => (
      agent.name?.toLowerCase().includes(q) ||
      agent.description?.toLowerCase().includes(q) ||
      agent.category?.toLowerCase().includes(q)
    ))
  }, [agents, searchQuery])

  const handleToggle = (agent) => {
    if (!agent?.id) return

    if (selectedIds.has(agent.id)) {
      const result = onRemoveAgent(agent.id)
      setFeedback(getMutationError(result, 'Unable to remove this agent from the collection.'))
      return
    }

    if (isFull) {
      setFeedback(`This collection is full. Remove an agent before adding another (${maxAgents} max).`)
      return
    }

    const result = onAddAgent(agent.id)
    setFeedback(getMutationError(result, 'Unable to add this agent to the collection.'))
  }

  return (
    <section className="premium-section rounded-2xl border border-gray-200 bg-white p-5 dark:border-border dark:bg-surface-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-text-primary">Manage agents</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-text-secondary">
            Check agents to include them in this collection. Uncheck agents to remove them.
          </p>
        </div>
        <div className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700 dark:border-accent/30 dark:bg-accent/10 dark:text-accent">
          {selectedCount} / {maxAgents} agents
        </div>
      </div>

      <label className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-border dark:bg-surface-input">
        <Search size={16} className="text-gray-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search agents by name, description, or category"
          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-text-primary"
        />
      </label>

      {isFull && (
        <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          Collection limit reached. Unchecked agents are disabled until you remove one of the selected agents.
        </p>
      )}
      {feedback && <p className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-300">{feedback}</p>}

      <div className="mt-4 max-h-[32rem] divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 dark:divide-border dark:border-border">
        {filteredAgents.map((agent) => {
          const checked = selectedIds.has(agent.id)
          const disabled = !checked && isFull

          return (
            <label
              key={agent.id}
              className={`flex cursor-pointer items-start gap-3 p-4 transition-colors ${disabled ? 'cursor-not-allowed opacity-55' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => handleToggle(agent)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:cursor-not-allowed"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-gray-900 dark:text-text-primary">{agent.name}</span>
                <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-gray-500 dark:text-text-secondary">{agent.description}</span>
                {agent.category && (
                  <span className="mt-2 inline-flex rounded-full border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:border-border dark:text-text-muted">
                    {agent.category}
                  </span>
                )}
              </span>
            </label>
          )
        })}

        {filteredAgents.length === 0 && (
          <p className="p-4 text-sm text-gray-500 dark:text-text-secondary">No agents match your search.</p>
        )}
      </div>
    </section>
  )
}
