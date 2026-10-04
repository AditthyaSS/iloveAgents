import { buildBattleStats, formatCost } from '../lib/battleStats'

export default function BattleStats({ content, durationMs, model }) {
  if (!content) return null
  const stats = buildBattleStats(content, durationMs, model)
  const items = [
    { label: 'Words', value: String(stats.words) },
    { label: 'Chars', value: String(stats.chars) },
    { label: 'Tokens', value: String(stats.tokens) },
    { label: 'Time', value: stats.seconds !== null ? `${stats.seconds.toFixed(1)}s` : 'n/a' },
    { label: 'Cost', value: formatCost(stats.cost) },
  ]
  return (
    <div
      aria-label="Response statistics"
      className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 rounded-lg border p-3
        dark:bg-surface-hover/50 dark:border-border bg-gray-50 border-gray-200"
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider dark:text-text-muted text-gray-400">
            {item.label}
          </div>
          <div className="text-xs font-semibold dark:text-text-primary text-gray-900 truncate">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}
