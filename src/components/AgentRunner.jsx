import { useState, useEffect, useRef, useCallback } from 'react'
import * as Icons from 'lucide-react'
import { Loader2, RotateCcw, Clock, Zap, StopCircle, ChevronDown, ChevronRight, Sparkles, RotateCw } from 'lucide-react'
import ApiKeyBar from './ApiKeyBar'
import OutputRenderer from './OutputRenderer'
import ErrorCard from './ErrorCard'
import { useApiKey } from '../lib/useApiKey'
import { streamAgent } from '../lib/llmAdapter'

const providerLabels = { openai: 'OpenAI', anthropic: 'Anthropic', gemini: 'Gemini', any: 'Any' }

const MODEL_MAP = {
  openai: 'gpt-4o',
  anthropic: 'claude-opus-4-20250514',
  gemini: 'gemini-2.5-flash',
}

const LOADING_MESSAGES = [
  '⚙️ Agent is grinding for you...',
  '🧠 Big brain moment loading...',
  '✨ Cooking something fire...',
  '🤖 Agent is in its era...',
  '💀 This might actually go crazy...',
  '🔥 Almost done, hold tight...',
  '🚀 Sending it...',
  '👀 Your agent is locked in...',
]

export default function AgentRunner({ agent }) {
  const { provider, setProvider, apiKey, setApiKey, saveForSession, setSaveForSession } = useApiKey()

  const [inputs, setInputs] = useState({})
  const [output, setOutput] = useState(null)
  const [streamingOutput, setStreamingOutput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [duration, setDuration] = useState(null)
  const [selectedModel, setSelectedModel] = useState(MODEL_MAP[provider] || MODEL_MAP.openai)
  const [playgroundOpen, setPlaygroundOpen] = useState(false)
  const [customPrompt, setCustomPrompt] = useState(agent.systemPrompt)
  const [msgIndex, setMsgIndex] = useState(0)

  const isPromptModified = customPrompt !== agent.systemPrompt
  const abortControllerRef = useRef(null)

  useEffect(() => {
    setSelectedModel(MODEL_MAP[provider] || MODEL_MAP.openai)
  }, [provider])

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setOutput(null)
    setStreamingOutput('')
    setIsStreaming(false)
    setError(null)
    setDuration(null)
    setCustomPrompt(agent.systemPrompt)
    setPlaygroundOpen(false)

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

    if (agent.provider !== 'any') {
      setProvider(agent.provider)
    } else if (agent.defaultProvider) {
      setProvider(agent.defaultProvider)
    }
  }, [agent.id])

  useEffect(() => {
    if (!loading || isStreaming) return
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [loading, isStreaming])

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

  const buildUserMessage = () => {
    const parts = []
    agent.inputs.forEach((input) => {
      const val = inputs[input.id]
      if (!val || (Array.isArray(val) && val.length === 0)) return
      parts.push(Array.isArray(val)
        ? `${input.label}: ${val.join(', ')}`
        : `${input.label}: ${val}`
      )
    })
    return parts.join('\n\n')
  }

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

  const hasInputContent = () => {
    if (output || streamingOutput || error) return true
    return agent.inputs.some((input) => {
      const v = inputs[input.id]
      if (Array.isArray(v)) return v.length > 0
      return v && v !== (input.defaultValue ?? '')
    })
  }

  const handleChunk = useCallback((chunk) => {
    setStreamingOutput((prev) => prev + chunk)
    setIsStreaming(true)
  }, [])

  const handleRun = async () => {
    setLoading(true)
    setError(null)
    setOutput(null)
    setStreamingOutput('')
    setIsStreaming(false)
    setDuration(null)
    setMsgIndex(0)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const actualProvider = agent.provider === 'any' ? provider : agent.provider
      const model = selectedModel || MODEL_MAP[actualProvider] || MODEL_MAP.openai

      const result = await streamAgent({
        provider: actualProvider,
        model,
        apiKey,
        systemPrompt: customPrompt,
        userMessage: buildUserMessage(),
        onChunk: handleChunk,
        signal: controller.signal,
      })

      setOutput(result.content)
      setStreamingOutput('')
      setIsStreaming(false)
      setDuration(result.duration)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setOutput(streamingOutput)
    setStreamingOutput('')
    setIsStreaming(false)
    setLoading(false)
  }

  const handleClear = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setOutput(null)
    setStreamingOutput('')
    setIsStreaming(false)
    setError(null)
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

  const handleFillExample = () => {
    if (!agent.exampleInputs) return
    setInputs((prev) => ({ ...prev, ...agent.exampleInputs }))
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
                  <option key={opt} value={opt}>{opt}</option>
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
                        ${selected
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

      <div className="mb-4">
        <button
          onClick={handleFillExample}
          className="text-xs font-medium text-accent hover:underline transition-colors"
        >
          Try an example →
        </button>
      </div>

      {/* Prompt Playground */}
      <div className="mb-4 rounded-lg border transition-all duration-200
        dark:bg-surface-card dark:border-border bg-white border-gray-200">
        <button
          onClick={() => setPlaygroundOpen(!playgroundOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-left group"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent" />
            <span className="text-xs font-semibold dark:text-text-primary text-gray-700">
              Prompt Playground
            </span>
            {isPromptModified && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full
                bg-amber-400/10 text-amber-500 border border-amber-400/20">
                Modified
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] dark:text-text-muted text-gray-400">
              {playgroundOpen ? 'Collapse' : 'Edit system prompt'}
            </span>
            {playgroundOpen
              ? <ChevronDown size={14} className="dark:text-text-muted text-gray-400 transition-transform" />
              : <ChevronRight size={14} className="dark:text-text-muted text-gray-400 transition-transform" />
            }
          </div>
        </button>

        {playgroundOpen && (
          <div className="px-4 pb-4 animate-fade-in">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[11px] font-medium dark:text-text-secondary text-gray-500">
                System Prompt
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] dark:text-text-muted text-gray-400">
                  {customPrompt.length} chars
                </span>
                {isPromptModified && (
                  <button
                    onClick={() => setCustomPrompt(agent.systemPrompt)}
                    className="flex items-center gap-1 text-[10px] font-medium text-accent hover:text-accent-hover transition-colors"
                    title="Reset to default prompt"
                  >
                    <RotateCw size={10} />
                    Reset
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={10}
              spellCheck={false}
              className="w-full px-3 py-2.5 rounded-lg text-xs font-mono leading-relaxed transition-colors resize-y
                dark:bg-[#0d1117] dark:border-border dark:text-gray-300 dark:placeholder:text-text-muted
                bg-gray-50 border border-gray-200 text-gray-700 placeholder:text-gray-400
                focus:ring-1 focus:ring-accent focus:border-accent outline-none"
              placeholder="Enter your custom system prompt..."
            />
            {isPromptModified && (
              <p className="mt-2 text-[10px] dark:text-amber-400/80 text-amber-600 flex items-center gap-1">
                <Sparkles size={10} />
                You're using a custom prompt. This won't affect other users.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mb-6">
        {loading ? (
          <button
            onClick={handleStop}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold
              text-white bg-red-500 hover:bg-red-600
              transition-all duration-200 active:scale-[0.98]"
          >
            <StopCircle size={16} />
            Stop
          </button>
        ) : (
          <button
            onClick={handleRun}
            disabled={!canRun()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white
              bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200 active:scale-[0.98]"
          >
            <Zap size={16} />
            Run Agent
          </button>
        )}

        <button
          onClick={handleClear}
          disabled={!hasInputContent()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-surface-hover
            text-gray-500 hover:text-gray-900 hover:bg-gray-100
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
        >
          <RotateCcw size={14} />
          Clear
        </button>

        {duration && (
          <div className="flex items-center gap-1 text-[11px] dark:text-text-muted text-gray-400 ml-auto">
            <Clock size={11} />
            {(duration / 1000).toFixed(1)}s
          </div>
        )}
      </div>

      {error && <ErrorCard message={error} />}

      {loading && !isStreaming && (
        <div className="rounded-lg border p-6 dark:bg-surface-card dark:border-border bg-white border-gray-200 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Loader2 size={16} className="animate-spin text-accent" />
            <span className="text-xs font-medium text-accent">Connecting to API...</span>
          </div>
          <p className="text-sm dark:text-text-secondary text-gray-500 transition-all duration-500">
            {LOADING_MESSAGES[msgIndex]}
          </p>
        </div>
      )}

      {isStreaming && streamingOutput && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">
              Output
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-accent">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Streaming...
            </span>
          </div>
          <div className="rounded-lg border p-4 dark:bg-surface-card dark:border-border bg-white border-gray-200">
            <div className="markdown-output text-sm dark:text-text-primary text-gray-900">
              <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                {streamingOutput}
                <span className="inline-block w-[2px] h-[1em] bg-accent animate-blink ml-0.5 align-middle" />
              </pre>
            </div>
          </div>
        </div>
      )}

      {output && !isStreaming && (
        <OutputRenderer
          content={output}
          outputType={agent.outputType}
          agentName={agent.name}
          systemPrompt={customPrompt}
        />
      )}
    </div>
  )
}
