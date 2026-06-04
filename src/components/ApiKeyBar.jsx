import { fetchGeminiModels } from '../lib/llmAdapter'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import CustomSelect from './CustomSelect'
import { MODELS } from '../lib/resolveAgentModel'
import ApiKeyInfo from './ApiKeyInfo'
import openaiLogo from "../assets/openai.svg";
import anthropicLogo from "../assets/anthropic.svg";
import geminiLogo from "../assets/gemini.svg";
import groqLogo from "../assets/groq.svg";
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'groq', label: 'Groq' },
]

const providerLogos = {
  openai: openaiLogo,
  anthropic: anthropicLogo,
  gemini: geminiLogo,
  groq: groqLogo,
}

const providerUrls = {
  openai: 'https://platform.openai.com/account/api-keys',
  anthropic: 'https://console.anthropic.com/keys',
  gemini: 'https://console.cloud.google.com/apis/credentials',
  groq: 'https://console.groq.com/keys',
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
  const [geminiModels, setGeminiModels] = useState([])
  const [geminiLoading, setGeminiLoading] = useState(false)
  const [geminiError, setGeminiError] = useState(null)

  useEffect(() => {
    if (provider !== 'gemini' || !apiKey?.trim()) {
      setGeminiModels([])
      setGeminiError(null)
      return
    }
    const timer = setTimeout(async () => {
      setGeminiLoading(true)
      setGeminiError(null)
      try {
        const models = await fetchGeminiModels(apiKey)
        setGeminiModels(models)
        if (models.length > 0) setModel(models[0].value)
      } catch {
        setGeminiError('Could not load Gemini models. Check your API key.')
        setGeminiModels([])
      } finally {
        setGeminiLoading(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [provider, apiKey])

  // Filter providers if agent requires a specific one
  const availableProviders = (
    agentProvider === 'any'
      ? PROVIDERS
      : PROVIDERS.filter((p) => p.value === agentProvider)
  ).map((p) => ({
    ...p,
    icon: (
      <img
        src={providerLogos[p.value]}
        alt={`${p.label} logo`}
        className="w-4 h-4 flex-shrink-0"
      />
    ),
  }))

  const availableModels =
    provider === 'gemini' ? geminiModels : MODELS[provider] || []

  useKeyboardShortcuts({
    'Alt+1': () => {
      const p = availableProviders.find(p => p.value === 'openai');
      if (p) setProvider('openai');
    },
    'Alt+2': () => {
      const p = availableProviders.find(p => p.value === 'anthropic');
      if (p) setProvider('anthropic');
    },
    'Alt+3': () => {
      const p = availableProviders.find(p => p.value === 'gemini');
      if (p) setProvider('gemini');
    },
    'Alt+4': () => {
      const p = availableProviders.find(p => p.value === 'groq');
      if (p) setProvider('groq');
    },
  });

  return (
    <div className="rounded-lg border p-3 mb-4 transition-theme
      dark:bg-surface-card dark:border-border bg-white border-gray-200">
      <div className="flex flex-wrap items-center gap-2">
        {/* Provider Select with Logo */}
        <CustomSelect
          value={provider}
          onChange={setProvider}
          options={availableProviders}
          className="w-auto min-w-[130px]"
          triggerClassName="h-8 py-0 px-2.5 font-semibold text-xs border dark:bg-surface-input dark:border-border hover:border-accent/30 dark:hover:border-accent/40 bg-white border-gray-200"
        />

        {/* Model Select */}
        <CustomSelect
          value={model}
          onChange={setModel}
          options={availableModels.map(m => ({ value: m.value, label: m.label }))}
          disabled={geminiLoading}
          placeholder={geminiLoading ? 'Loading models...' : 'Select Model'}
          className="w-auto min-w-[150px]"
          triggerClassName="h-8 py-0 px-2.5 font-semibold text-xs border dark:bg-surface-input dark:border-border hover:border-accent/30 dark:hover:border-accent/40 bg-white border-gray-200"
        />

        {/* API Key Input */}
        <div className="flex-1 min-w-[180px] relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter your ${provider} API key...`}
            className="w-full h-8 px-3 pr-10 rounded-md text-xs font-mono transition-colors
              dark:bg-surface-input dark:border-border dark:text-text-primary dark:placeholder:text-text-muted
              bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400
              focus:ring-1 focus:ring-accent focus:border-accent outline-none"
          />
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <ApiKeyInfo provider={provider} url={providerUrls[provider]} />
          </div>
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

      {/* Gemini model fetch error */}
      {geminiError && (
        <div className="mt-2 px-2.5 py-1.5 rounded-md bg-warning/10 border border-warning/20">
          <span className="text-[11px] text-warning font-medium">
            ⚠ {geminiError}
          </span>
        </div>
      )}
    </div>
  )
}