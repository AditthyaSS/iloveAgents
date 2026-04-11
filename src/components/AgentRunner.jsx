import { useState, useEffect } from 'react'
import * as Icons from 'lucide-react'
import { Loader2, RotateCcw, Clock, Zap } from 'lucide-react'
import ApiKeyBar from './ApiKeyBar'
import OutputRenderer from './OutputRenderer'
import ErrorCard from './ErrorCard'
import { useApiKey } from '../lib/useApiKey'
import { runAgent } from '../lib/llmAdapter'

const providerLabels = { openai: 'OpenAI', anthropic: 'Anthropic', gemini: 'Gemini', any: 'Any' }

const MODEL_MAP = {
  openai: 'gpt-4o',
  anthropic: 'claude-opus-4-20250514',
  gemini: 'gemini-2.5-flash',
}

const LOADING_MESSAGES = [
  "⚙️ Agent is grinding for you...",
  "🧠 Big brain moment loading...",
  "✨ Cooking something fire...",
  "🤖 Agent is in its era...",
  "💀 This might actually go crazy...",
  "🔥 Almost done, hold tight...",
  "🚀 Sending it...",
  "👀 Your agent is locked in...",
]

export default function AgentRunner({ agent }) {
  const { provider, setProvider, apiKey, setApiKey, saveForSession, setSaveForSession } = useApiKey()

  const [inputs, setInputs] = useState({})
  const [output, setOutput] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tokensUsed, setTokensUsed] = useState(null)
  const [duration, setDuration] = useState(null)
  const [selectedModel, setSelectedModel] = useState(MODEL_MAP[provider] || MODEL_MAP.openai)
  const [msgIndex, setMsgIndex] = useState(0)

  // Auto-update model when provider changes
  useEffect(() => {
    setSelectedModel(MODEL_MAP[provider] || MODEL_MAP.openai)
  }, [provider])

  // Reset state when agent changes
  useEffect(() => {
    setOutput(null)
    setError(null)
    setTokensUsed(null)
    setDuration(null)

    // Set defaults
    const defaults = {}
    agent.inputs.forEach((input) => {
      if (input.defaultValue !== undefined) {
        defaults[input.id] = input.defaultValue
      } else if (input.type === 'multiselect') {
        defaults[input.id] = []
      } else {
        defaults[input.id] = ''
      }
    })
    setInputs(defaults)

    // Set provider
    if (agent.provider !== 'any') {
      setProvider(agent.provider)
    } else if (agent.defaultProvider) {
      setProvider(agent.defaultProvider)
    }
  }, [agent.id])

  // Rotate loading messages while agent is running
  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [loading])

  const updateInput = (id, value) => {
    setInputs((prev) => ({ ...prev, [id]: value }))
  }

  const toggleMultiselect = (id, option) => {
    setInputs((prev) => {
      const current = prev[id] || []
      return {
        ...prev,
        [id]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      }
    })
  }

  // Build the user message from inputs
  const buildUserMessage = () => {
    const parts = []
    agent.inputs.forEach((input) => {
      const val = inputs[input.id]
      if (!val || (Array.isArray(val) && val.length === 0)) return

      const label = input.label
      if (Array.isArray(val)) {
        parts.push(`${label}: ${val.join(', ')}`)
      } else {
        parts.push(`${label}: ${val}`)
      }
    })
    return parts.join('\n\n')
  }

  // Validate required inputs
  const canRun = () => {
    if (!apiKey) return false
    return agent.inputs
      .filter((i) => i.required)
      .every((i) => {
        const v = inputs[i.id]
        if (Array.isArray(v)) return v.length > 0
        return v && v.trim() !== ''
      })
  }

  const handleRun = async () => {
    setLoading(true)
    setError(null)
    setOutput(null)
    setTokensUsed(null)
    setDuration(null)
    setMsgIndex(0)

    try {
      const actualProvider = agent.provider === 'any' ? provider : agent.provider
      const model = selectedModel || MODEL_MAP[actualProvider] || MODEL_MAP.openai

      const result = await runAgent({
        provider: actualProvider,
        model,
        apiKey,
        systemPrompt: agent.systemPrompt,
        userMessage: buildUserMessage(),
      })

      setOutput(result.content)
      setTokensUsed(result.tokens)
      setDuration(result.duration)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setOutput(null)
    setError(null)
    setTokensUsed(null)
    setDuration(null)
    const defaults = {}
    agent.inputs.forEach((input) => {
      if (input.defaultValue !== undefined) {
        defaults[input.id] = input.defaultValue
      } else if (input.type === 'multiselect') {
        defaults[input.id] = []
      } else {
        defaults[input.id] = ''
      }
    })
    setInputs(defaults)
  }

  const IconComponent = Icons[agent.icon] || Icons.Bot

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Agent Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
          <IconComponent size={24} className="text-accent" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-lg font-bold dark:text-text-primary text-gray-900">
              {agent.name}
            </h1>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full
              dark:bg-surface-input dark:text-text-muted dark:border-border
              bg-gray-100 text-gray-500 border border-gray-200">
              {agent.category}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              {providerLabels[agent.provider] || agent.provider}
            </span>
          </div>
          <p className="text-xs dark:text-text-secondary text-gray-500">
            {agent.description}
          </p>
        </div>
      </div>

      {/* API Key Bar */}
      <ApiKeyBar
        provider={provider}
        setProvider={setProvider}
        apiKey={apiKey}
        setApiKey={setApiKey}
        saveForSession={saveForSession}
        setSaveForSession={setSaveForSession}
        agentProvider={agent.provider}
        model={selectedModel}
        setModel={setSelectedModel}
      />

      {/* Input Form */}
      <div className="space-y-3 mb-4">
        {agent.inputs.map((input) => (
          <div key={input.id}>
            <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1.5">
              {input.label}
              {input.required && <span className="text-error ml-0.5">*</span>}
            </label>

            {input.type === 'text' && (
              <input
                type="text"
                value={inputs[input.id] || ''}
                onChange={(e) => updateInput(input.id, e.target.value)}
                placeholder={input.placeholder}
                className="w-full h-9 px-3 rounded-md text-sm transition-colors
                  dark:bg-surface-input dark:border-border dark:text-text-primary dark:placeholder:text-text-muted
                  bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400
                  focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              />
            )}

            {input.type === 'textarea' && (
              <textarea
                value={inputs[input.id] || ''}
                onChange={(e) => updateInput(input.id, e.target.value)}
                placeholder={input.placeholder}
                rows={4}
                className="w-full px-3 py-2 rounded-md text-sm transition-colors resize-y
                  dark:bg-surface-input dark:border-border dark:text-text-primary dark:placeholder:text-text-muted
                  bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400
                  focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              />
            )}

            {input.type === 'code' && (
              <textarea
                value={inputs[input.id] || ''}
                onChange={(e) => updateInput(input.id, e.target.value)}
                placeholder={input.placeholder}
                rows={8}
                className="w-full px-3 py-2 rounded-md text-xs font-mono transition-colors resize-y leading-relaxed
                  dark:bg-[#0d1117] dark:border-border dark:text-green-300 dark:placeholder:text-text-muted
                  bg-gray-900 border border-gray-700 text-green-400 placeholder:text-gray-500
                  focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                spellCheck={false}
              />
            )}

            {input.type === 'select' && (
              <select
                value={inputs[input.id] || input.defaultValue || ''}
                onChange={(e) => updateInput(input.id, e.target.value)}
                className="h-9 px-3 rounded-md text-sm cursor-pointer transition-colors
                  dark:bg-surface-input dark:border-border dark:text-text-primary
                  bg-gray-50 border border-gray-200 text-gray-900
                  focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              >
                {input.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {input.type === 'multiselect' && (
              <div className="flex flex-wrap gap-2">
                {input.options?.map((opt) => {
                  const selected = (inputs[input.id] || []).includes(opt)
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleMultiselect(input.id, opt)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border
                        ${
                          selected
                            ? 'bg-accent/15 text-accent border-accent/30'
                            : 'dark:bg-surface-input dark:text-text-secondary dark:border-border dark:hover:border-accent/30 bg-gray-50 text-gray-500 border-gray-200 hover:border-indigo-300'
                        }`}
                    >
                      {selected && '✓ '}{opt}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={handleRun}
          disabled={!canRun() || loading}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white
            bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200 active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Zap size={16} />
          )}
          {loading ? 'Running...' : 'Run Agent'}
        </button>

        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-surface-hover
            text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        >
          <RotateCcw size={14} />
          Clear
        </button>

        {/* Stats */}
        {(tokensUsed || duration) && (
          <div className="flex items-center gap-3 ml-auto">
            {tokensUsed > 0 && (
              <span className="flex items-center gap-1 text-[11px] dark:text-text-muted text-gray-400">
                <Zap size={11} />
                {tokensUsed.toLocaleString()} tokens
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1 text-[11px] dark:text-text-muted text-gray-400">
                <Clock size={11} />
                {(duration / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && <ErrorCard message={error} />}

      {/* Loading State */}
      {loading && (
        <div className="rounded-lg border p-6 dark:bg-surface-card dark:border-border bg-white border-gray-200 text-center animate-fade-in">
          <p className="text-sm dark:text-text-secondary text-gray-500 transition-all duration-500">
            {LOADING_MESSAGES[msgIndex]}
          </p>
        </div>
      )}

      {/* Output */}
      {output && (
        <OutputRenderer
          content={output}
          outputType={agent.outputType}
          agentName={agent.name}
          systemPrompt={agent.systemPrompt}
        />
      )}
    </div>
  )
}