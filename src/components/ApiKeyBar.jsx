import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { MODELS } from '../lib/resolveAgentModel'
import openaiLogo from "../assets/openai.svg";
import anthropicLogo from "../assets/anthropic.svg";
import geminiLogo from "../assets/gemini.svg";

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'gemini', label: 'Gemini' },
]

const providerLogos = {
  openai: openaiLogo,
  anthropic: anthropicLogo,
  gemini: geminiLogo,
};



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
        {/* Provider Select with Logo */}
        <div
          className="flex items-center gap-2 h-8 px-2.5 rounded-md border transition-colors
            dark:bg-surface-input dark:border-border
            bg-white border-gray-200">
          <img
            src={providerLogos[provider]}
            alt={`${provider} logo`}
            className="w-4 h-4 flex-shrink-0"
          />

          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="h-full bg-transparent text-xs font-medium cursor-pointer outline-none
              dark:text-white text-gray-900">
            {availableProviders.map((p) => (
              <option
                key={p.value}
                value={p.value}
                className="text-black"
              >
                {p.label}
              </option>
            ))}
          </select>
        </div>

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
            <option key={m.value} value={m.value} className="text-black">
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
