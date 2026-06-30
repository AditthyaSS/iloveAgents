import { useTokenCounter } from '../lib/useTokenCounter'
import { getPricing, getContextWindow } from '../lib/modelPricing'

function formatCost(cost) {
  if (cost == null || isNaN(cost)) return '—'
  if (cost < 0.0001) return '< $0.0001'
  return `$${cost.toFixed(4)}`
}

function formatCostShort(cost) {
  if (cost == null || isNaN(cost)) return '—'
  if (cost < 0.0001) return '<$0.0001'
  if (cost < 0.01) return `$${cost.toFixed(4)}`
  return `$${cost.toFixed(2)}`
}

export default function CostEstimator({ inputText = '', systemPrompt = '', modelId = '' }) {
  const { tokens: inputTokens } = useTokenCounter(inputText)
  const { tokens: systemTokens } = useTokenCounter(systemPrompt)
  const totalInputTokens = inputTokens + systemTokens

  const pricing = getPricing(modelId)
  const contextWindow = getContextWindow(modelId)
  const ratio = contextWindow > 0 ? totalInputTokens / contextWindow : 0

  const isNearLimit = ratio > 0.7
  const isOverLimit = ratio > 0.95

  const projectedOutputTokens = Math.min(Math.round(totalInputTokens * 0.5), 4096)

  const inputCost = pricing ? (totalInputTokens / 1_000_000) * pricing.inputCostPer1M : null
  const outputCost = pricing ? (projectedOutputTokens / 1_000_000) * pricing.outputCostPer1M : null
  const totalCost = (inputCost ?? 0) + (outputCost ?? 0)

  if (!pricing) return null

  return (
    <div className="rounded-lg border dark:bg-surface-card dark:border-border bg-white border-gray-200 p-3 text-xs">
      <div className="flex items-center gap-1.5 mb-2">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="dark:text-text-muted text-gray-400"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <span className="font-semibold dark:text-text-primary text-gray-900">
          Cost Estimate
        </span>
        <span className="dark:text-text-muted text-gray-400">·</span>
        <span className="dark:text-text-muted text-gray-400">{pricing.provider}</span>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="dark:text-text-secondary text-gray-500">Input ({totalInputTokens.toLocaleString()} tokens)</span>
          <span className="dark:text-text-primary text-gray-900 font-medium tabular-nums">
            {formatCost(inputCost)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="dark:text-text-secondary text-gray-500">
            Output (~{projectedOutputTokens.toLocaleString()} tokens est.)
          </span>
          <span className="dark:text-text-primary text-gray-900 font-medium tabular-nums">
            {formatCost(outputCost)}
          </span>
        </div>
        <div className="border-t dark:border-border border-gray-200 pt-1.5 mt-1.5 flex justify-between">
          <span className="font-semibold dark:text-text-primary text-gray-900">Estimated Total</span>
          <span className="font-bold dark:text-text-primary text-gray-900 tabular-nums">
            {formatCostShort(totalCost)}
          </span>
        </div>
      </div>

      <div className="mt-2">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="dark:text-text-muted text-gray-400">Context window</span>
          <span className={`font-medium ${isOverLimit ? 'text-error' : isNearLimit ? 'text-warning' : 'dark:text-text-muted text-gray-400'}`}>
            {Math.round(ratio * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full dark:bg-surface-input bg-gray-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverLimit
                ? 'bg-error'
                : isNearLimit
                  ? 'bg-warning'
                  : 'bg-accent'
            }`}
            style={{ width: `${Math.min(ratio * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
