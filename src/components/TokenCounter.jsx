import { useTokenCounter } from '../lib/useTokenCounter'
import { getContextWindow } from '../lib/modelPricing'

export default function TokenCounter({ value = '', modelId = '' }) {
  const { tokens, isEstimating } = useTokenCounter(value)
  const contextWindow = getContextWindow(modelId)

  const ratio = contextWindow > 0 ? tokens / contextWindow : 0
  const isNearLimit = ratio > 0.7
  const isOverLimit = ratio > 0.95

  const colorClass = isOverLimit
    ? 'text-error'
    : isNearLimit
      ? 'text-warning'
      : 'dark:text-text-muted text-gray-400'

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors ${colorClass}`}>
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-70"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>
        ~{tokens.toLocaleString()} tokens
        {isEstimating && (
          <span className="ml-0.5 inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin align-middle" />
        )}
      </span>
      {contextWindow > 0 && (
        <span className="opacity-60">
          / {contextWindow.toLocaleString()}
        </span>
      )}
    </span>
  )
}
