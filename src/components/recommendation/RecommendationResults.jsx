import { SearchX } from 'lucide-react'
import RecommendationResultCard from './RecommendationResultCard'

export default function RecommendationResults({ agents = [], results = [], onRefine, onStartOver, onClose }) {
  const agentById = new Map(agents.map((agent) => [agent.id, agent]))
  const resolved = results.map((result) => ({ result, agent: agentById.get(result.agentId) })).filter(({ agent }) => agent)

  if (!resolved.length) {
    return (
      <div className="text-center py-10 rounded-xl border bg-white border-gray-200 dark:bg-surface-card dark:border-border px-4">
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4"><SearchX size={24} className="text-accent" aria-hidden="true" /></div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-text-primary mb-1">No confident matches yet</h3>
        <p className="text-xs text-gray-500 dark:text-text-secondary mb-4">Try broadening your provider or removing optional preferences.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-2">
          <button type="button" onClick={onRefine} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-accent/40 dark:bg-surface-input dark:border-border dark:text-text-primary">Adjust answers</button>
          <button type="button" onClick={onClose} className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white hover:bg-accent-hover">Browse all agents</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 id="recommendation-wizard-title" className="text-lg font-bold text-gray-900 dark:text-text-primary">Recommended agents for you</h2>
        <p className="text-xs text-gray-500 dark:text-text-secondary mt-1">Based on your goal, level, and preferences. Match reflects your answers, not agent quality.</p>
      </div>
      <div className="space-y-3">
        {resolved.map(({ agent, result }, index) => <RecommendationResultCard key={result.agentId} rank={index + 1} agent={agent} result={result} onOpenAgent={onClose} />)}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-between border-t border-gray-200 dark:border-border pt-4">
        <button type="button" onClick={onStartOver} className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 hover:text-accent dark:text-text-secondary">Start over</button>
        <div className="flex flex-col sm:flex-row gap-2">
          <button type="button" onClick={onRefine} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-accent/40 dark:bg-surface-input dark:border-border dark:text-text-primary">Refine answers</button>
          <button type="button" onClick={onClose} className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white hover:bg-accent-hover">Browse all agents</button>
        </div>
      </div>
    </div>
  )
}
