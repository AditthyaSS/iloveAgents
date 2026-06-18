/**
 * AgentCardSkeleton — placeholder UI shown while agent data is being
 * lazily loaded via loadAllAgents(). Mirrors AgentCard's dimensions
 * to prevent layout shift once real data arrives.
 */
export default function AgentCardSkeleton() {
  return (
    <div
      className="rounded-lg border p-4 bg-white border-gray-200
      dark:bg-surface-card dark:border-border animate-pulse"
      aria-hidden="true"
    >
      {/* Top row: icon + badges */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-surface-input" />
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-12 rounded-full bg-gray-200 dark:bg-surface-input" />
        </div>
      </div>

      {/* Name + description */}
      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-surface-input mb-2" />
      <div className="h-3 w-full rounded bg-gray-200 dark:bg-surface-input mb-1.5" />
      <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-surface-input mb-3" />

      {/* Bottom: provider badge */}
      <div className="flex items-center justify-between mt-auto">
        <div className="h-4 w-16 rounded-full bg-gray-200 dark:bg-surface-input" />
        <div className="h-3 w-10 rounded bg-gray-200 dark:bg-surface-input" />
      </div>
    </div>
  )
}