/**
 * AgentDetailSkeleton — placeholder layout displayed when an individual agent's
 * detail runner page is loading. Matches AgentRunner's header, inputs, and preview structure.
 */
export default function AgentDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse" aria-hidden="true">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b dark:border-border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-surface-input shrink-0" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-48 rounded bg-gray-200 dark:bg-surface-input" />
              <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-surface-input" />
            </div>
            <div className="h-4 w-72 rounded bg-gray-200 dark:bg-surface-input" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 rounded-lg bg-gray-200 dark:bg-surface-input" />
          <div className="h-9 w-24 rounded-lg bg-gray-200 dark:bg-surface-input" />
        </div>
      </div>

      {/* Main Grid: Form Inputs (Left) and Output Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form Inputs Skeleton */}
        <div className="rounded-2xl border dark:border-border border-gray-200 p-6 dark:bg-surface-card bg-white space-y-6">
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-surface-input" />
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-surface-input" />
              <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-surface-input" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3.5 w-36 rounded bg-gray-200 dark:bg-surface-input" />
              <div className="h-28 w-full rounded-lg bg-gray-200 dark:bg-surface-input" />
            </div>
          </div>
          <div className="h-11 w-full rounded-xl bg-gray-200 dark:bg-surface-input mt-4" />
        </div>

        {/* Output Panel Skeleton */}
        <div className="rounded-2xl border dark:border-border border-gray-200 p-6 dark:bg-surface-card bg-white space-y-4 min-h-[360px]">
          <div className="flex items-center justify-between pb-4 border-b dark:border-border border-gray-200">
            <div className="h-4 w-28 rounded bg-gray-200 dark:bg-surface-input" />
            <div className="h-7 w-20 rounded bg-gray-200 dark:bg-surface-input" />
          </div>
          <div className="space-y-3 pt-2">
            <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-surface-input" />
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-surface-input" />
            <div className="h-4 w-4/6 rounded bg-gray-200 dark:bg-surface-input" />
            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-surface-input" />
          </div>
        </div>
      </div>
    </div>
  )
}
