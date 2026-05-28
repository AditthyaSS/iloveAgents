import { fetchGeminiModels, validateProviderKey } from '../lib/llmAdapter'
import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { MODELS } from '../lib/resolveAgentModel'
import ApiKeyInfo from './ApiKeyInfo'
import openaiLogo from "../assets/openai.svg";
import anthropicLogo from "../assets/anthropic.svg";
import geminiLogo from "../assets/gemini.svg";
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'gemini', label: 'Gemini' },
]

const providerLogos = {
  openai: openaiLogo,
  anthropic: anthropicLogo,
  gemini: geminiLogo,
}

const providerUrls = {
  openai: 'https://platform.openai.com/account/api-keys',
  anthropic: 'https://console.anthropic.com/keys',
  gemini: 'https://console.cloud.google.com/apis/credentials',
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
  const [testStatusByProvider, setTestStatusByProvider] = useState({})
  const [testMessageByProvider, setTestMessageByProvider] = useState({})
  const [validatedKeyByProvider, setValidatedKeyByProvider] = useState({})
  const testRequestIdRef = useRef(0)
  const providerRef = useRef(provider)
  const apiKeyRef = useRef(apiKey)

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

  useEffect(() => {
    providerRef.current = provider
  }, [provider])

  useEffect(() => {
    apiKeyRef.current = apiKey
  }, [apiKey])

  // Filter providers if agent requires a specific one
  const availableProviders =
    agentProvider === 'any'
      ? PROVIDERS
      : PROVIDERS.filter((p) => p.value === agentProvider)

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
  });

  const currentTestStatus = testStatusByProvider[provider]
  const currentTestMessage = testMessageByProvider[provider]
  const validatedKey = validatedKeyByProvider[provider]
  const isStale = Boolean(
    currentTestStatus === 'success' &&
      validatedKey &&
      apiKey &&
      apiKey !== validatedKey
  )
  const displayStatus = apiKey ? (isStale ? 'stale' : currentTestStatus) : null
  const displayMessage = apiKey
    ? (isStale ? 'Key modified - re-test recommended.' : currentTestMessage)
    : null
  const isTesting = currentTestStatus === 'loading'
  const testButtonDisabled = !apiKey?.trim() || isTesting

  const handleApiKeyChange = (value) => {
    setApiKey(value)

    if (currentTestStatus === 'loading') {
      setTestStatusByProvider((prev) => {
        if (!prev[provider]) return prev
        const next = { ...prev }
        delete next[provider]
        return next
      })
      setTestMessageByProvider((prev) => {
        if (!prev[provider]) return prev
        const next = { ...prev }
        delete next[provider]
        return next
      })
    }
  }

  const handleTestKey = async () => {
    if (!apiKey?.trim()) return

    const requestId = ++testRequestIdRef.current
    const requestProvider = provider
    const requestKey = apiKey

    setTestStatusByProvider((prev) => ({
      ...prev,
      [requestProvider]: 'loading',
    }))
    setTestMessageByProvider((prev) => ({
      ...prev,
      [requestProvider]: '',
    }))

    let result
    try {
      result = await validateProviderKey(requestProvider, requestKey)
    } catch {
      result = {
        valid: false,
        code: 'unknown_error',
        message: 'API key validation failed. Please try again.',
      }
    }

    if (requestId !== testRequestIdRef.current) return
    if (providerRef.current !== requestProvider) return
    if (apiKeyRef.current !== requestKey) return

    if (result.valid) {
      setValidatedKeyByProvider((prev) => ({
        ...prev,
        [requestProvider]: requestKey,
      }))
      setTestStatusByProvider((prev) => ({
        ...prev,
        [requestProvider]: 'success',
      }))
      setTestMessageByProvider((prev) => ({
        ...prev,
        [requestProvider]: result.message || 'API key verified.',
      }))
      return
    }

    setTestStatusByProvider((prev) => ({
      ...prev,
      [requestProvider]: 'error',
    }))
    setTestMessageByProvider((prev) => ({
      ...prev,
      [requestProvider]: result.message || 'API key validation failed.',
    }))
  }

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
          disabled={geminiLoading}
          className="h-8 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer
            dark:bg-surface-input dark:border-border dark:text-text-primary
            bg-gray-50 border border-gray-200 text-gray-900
            focus:ring-1 focus:ring-accent focus:border-accent outline-none
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {geminiLoading
            ? <option>Loading models...</option>
            : availableModels.map((m) => (
                <option key={m.value} value={m.value} className="text-black">
                  {m.label}
                </option>
              ))
          }
        </select>

        {/* API Key Input */}
        <div className="flex-1 min-w-[180px] relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
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

        <button
          type="button"
          onClick={handleTestKey}
          disabled={testButtonDisabled}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white
            bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200 active:scale-[0.98]"
        >
          {isTesting ? 'Testing...' : 'Test Key'}
        </button>

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

      {displayStatus && (
        <div className="mt-2">
          <span
            className={`text-[11px] font-medium ${
              displayStatus === 'success'
                ? 'text-success'
                : displayStatus === 'loading'
                ? 'text-gray-500'
                : displayStatus === 'error'
                ? 'text-error'
                : 'text-warning'
            }`}
          >
            {displayStatus === 'loading'
              ? 'Validating key...'
              : displayMessage ||
                (displayStatus === 'success'
                  ? 'API key verified.'
                  : 'API key validation failed.')}
          </span>
        </div>
      )}

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