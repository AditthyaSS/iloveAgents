import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'gemini', label: 'Gemini' },
]

const MODELS = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4.1', label: 'GPT-4.1' },
    { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
    { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
    { value: 'o3-mini', label: 'o3-mini' },
  ],
  anthropic: [
    { value: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
  ],
  gemini: [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  ],
}

export default function ApiKeyBar({
  provider,
  setProvider,
  apiKey,
  setApiKey,
  saveForSession,
  setSaveForSession,
  agentProvider,
  model,
  setModel,
}) {
  const [showKey, setShowKey] = useState(false)

  // Filter providers if agent requires a specific one
  const availableProviders =
    agentProvider === 'any'
      ? PROVIDERS
      : PROVIDERS.filter((p) => p.value === agentProvider)

  const availableModels = MODELS[provider] || []

  return (
    <div className="rounded-lg border p-3 mb-4 transition-theme
      dark:bg-surface-card dark:border-border bg-white border-gray-200">
      <div className="flex flex-wrap items-center gap-2">
        {/* Provider Select */}
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="h-8 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer
            dark:bg-surface-input dark:border-border dark:text-text-primary
            bg-gray-50 border border-gray-200 text-gray-900
            focus:ring-1 focus:ring-accent focus:border-accent outline-none"
        >
          {availableProviders.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Model Select */}
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="h-8 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer
            dark:bg-surface-input dark:border-border dark:text-text-primary
            bg-gray-50 border border-gray-200 text-gray-900
            focus:ring-1 focus:ring-accent focus:border-accent outline-none"
        >
          {availableModels.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* API Key Input */}
        <div className="flex-1 min-w-[180px] relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter your ${provider} API key...`}
            className="w-full h-8 px-3 pr-8 rounded-md text-xs font-mono transition-colors
              dark:bg-surface-input dark:border-border dark:text-text-primary dark:placeholder:text-text-muted
              bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400
              focus:ring-1 focus:ring-accent focus:border-accent outline-none"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 dark:text-text-muted text-gray-400
              hover:text-accent transition-colors"
            aria-label={showKey ? 'Hide key' : 'Show key'}
          >
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        {/* Save checkbox */}
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={saveForSession}
            onChange={(e) => setSaveForSession(e.target.checked)}
            className="w-3.5 h-3.5 rounded accent-accent cursor-pointer"
          />
          <span className="text-[11px] dark:text-text-secondary text-gray-500 whitespace-nowrap">
            Save for session
          </span>
        </label>
      </div>

      {/* Disclaimer */}
      <div className="flex items-center gap-1.5 mt-2">
        <ShieldCheck size={12} className="text-success flex-shrink-0" />
        <span className="text-[10px] dark:text-text-muted text-gray-400">
          Your key is never sent to our servers. It's used directly from your browser.
        </span>
      </div>

      {/* Warning if no key */}
      {!apiKey && (
        <div className="mt-2 px-2.5 py-1.5 rounded-md bg-warning/10 border border-warning/20">
          <span className="text-[11px] text-warning font-medium">
            ⚠ Enter an API key to run this agent.
          </span>
        </div>
      )}
    </div>
  )
}
