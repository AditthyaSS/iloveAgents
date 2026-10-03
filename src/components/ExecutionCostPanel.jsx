import { getPricing, estimateInputCost, estimateOutputCost } from '../lib/modelPricing'
import { Coins, Info } from 'lucide-react'

function formatCost(cost) {
  if (cost == null || isNaN(cost)) return '—'
  if (cost < 0.0001) return '< $0.0001'
  return `$${cost.toFixed(4)}`
}

const providerLabels = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Gemini",
  openrouter: "OpenRouter",
  any: "Any",
};

export default function ExecutionCostPanel({ modelId, provider, inputTokens, outputTokens }) {
  if (!inputTokens || !outputTokens) return null;

  const pricing = getPricing(modelId)
  
  const inputCost = pricing ? estimateInputCost(modelId, inputTokens) : null
  const outputCost = pricing ? estimateOutputCost(modelId, outputTokens) : null
  const totalCost = pricing && inputCost !== null && outputCost !== null ? inputCost + outputCost : null

  const totalTokens = inputTokens + outputTokens

  return (
    <div className="mt-4 rounded-lg border dark:bg-surface-card dark:border-border bg-white border-gray-200 p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Coins size={16} className="text-accent" />
          <span className="text-sm font-semibold dark:text-text-primary text-gray-900">
            Execution Cost Estimate
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
            {providerLabels[provider] || provider}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full dark:bg-surface-input dark:text-text-secondary bg-gray-100 text-gray-600 border border-gray-200">
            {modelId}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tokens Breakdown */}
        <div className="col-span-1 md:col-span-2 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="dark:text-text-secondary text-gray-500">Input Tokens</span>
            <span className="dark:text-text-primary text-gray-900 font-medium tabular-nums">{inputTokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="dark:text-text-secondary text-gray-500">Output Tokens</span>
            <span className="dark:text-text-primary text-gray-900 font-medium tabular-nums">{outputTokens.toLocaleString()}</span>
          </div>
          <div className="border-t dark:border-border border-gray-200 pt-2 flex justify-between text-xs">
            <span className="font-semibold dark:text-text-primary text-gray-900">Total Tokens</span>
            <span className="font-bold dark:text-text-primary text-gray-900 tabular-nums">{totalTokens.toLocaleString()}</span>
          </div>
        </div>

        {/* Cost Estimation */}
        <div className="col-span-1 border-t md:border-t-0 md:border-l dark:border-border border-gray-200 pt-3 md:pt-0 md:pl-4 flex flex-col justify-center">
          <span className="text-[10px] dark:text-text-secondary text-gray-500 uppercase tracking-wider font-semibold mb-1">
            Estimated Cost
          </span>
          <div className="text-2xl font-bold dark:text-text-primary text-gray-900 tabular-nums tracking-tight">
             {pricing ? formatCost(totalCost) : '—'}
          </div>
          {!pricing && (
            <span className="text-[10px] text-gray-400 mt-1">Pricing unavailable</span>
          )}
        </div>
      </div>
      
      <div className="mt-3 flex items-start gap-1.5 text-[10px] dark:text-text-muted text-gray-400">
        <Info size={12} className="shrink-0 mt-[1px]" />
        <p>
          These values are approximate estimates based on a standard calculation (1 token ≈ 4 chars). Actual billing by the provider may vary.
        </p>
      </div>
    </div>
  )
}
