import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Cpu, Loader2, Trophy, AlertCircle, ArrowLeft } from 'lucide-react'
import { runAgent } from '../lib/llmAdapter'
import BattleNavbar from '../components/BattleNavbar'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const PROVIDERS = [
  {
    id: 'openai',
    label: 'GPT-4o',
    model: 'gpt-4o',
    color: 'yellow',
    borderClass: 'border-yellow-400/40 battle-card-yellow',
    glowClass: 'hover:shadow-yellow-400/30',
    headerBg: 'bg-yellow-400/10 border-b border-yellow-400/30',
    textColor: 'text-yellow-400',
    btnBg: 'bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border-yellow-400/40 border-2 hover:border-yellow-300/60 battle-btn-secondary',
    loaderColor: 'text-yellow-400',
  },
  {
    id: 'anthropic',
    label: 'Claude Sonnet',
    model: 'claude-sonnet-4-6',
    color: 'violet',
    borderClass: 'border-violet-400/40 battle-card-violet',
    glowClass: 'hover:shadow-violet-400/30',
    headerBg: 'bg-violet-400/10 border-b border-violet-400/30',
    textColor: 'text-violet-400',
    btnBg: 'bg-violet-400/10 hover:bg-violet-400/20 text-violet-400 border-violet-400/40 border-2 hover:border-violet-300/60 battle-btn-secondary',
    loaderColor: 'text-violet-400',
  },
  {
    id: 'gemini',
    label: 'Gemini Flash',
    model: 'gemini-2.5-flash',
    color: 'blue',
    borderClass: 'border-blue-400/40 battle-card-blue',
    glowClass: 'hover:shadow-blue-400/30',
    headerBg: 'bg-blue-400/10 border-b border-blue-400/30',
    textColor: 'text-blue-400',
    btnBg: 'bg-blue-400/10 hover:bg-blue-400/20 text-blue-400 border-blue-400/40 border-2 hover:border-blue-300/60 battle-btn-secondary',
    loaderColor: 'text-blue-400',
  },
]

function buildUserMessage(agent, inputs) {
  const parts = []
  agent.inputs.forEach((input) => {
    const val = inputs[input.id]
    if (!val || (Array.isArray(val) && val.length === 0)) return
    parts.push(
      Array.isArray(val)
        ? `${input.label}: ${val.join(', ')}`
        : `${input.label}: ${val}`
    )
  })
  return parts.join('\n\n')
}

export default function BattleModeArena() {
  const navigate = useNavigate()
  const location = useLocation()
  const { agent, inputs, apiKeys } = location.state || {}

  const [results, setResults] = useState({
    openai: { loading: true, content: null, error: null, duration: null },
    anthropic: { loading: true, content: null, error: null, duration: null },
    gemini: { loading: true, content: null, error: null, duration: null },
  })

  // Redirect if no state
  useEffect(() => {
    if (!agent || !inputs || !apiKeys) {
      navigate('/battle/setup', { replace: true })
    }
  }, [agent, inputs, apiKeys, navigate])

  // Fire all three API calls simultaneously
  useEffect(() => {
    if (!agent || !inputs || !apiKeys) return

    const userMessage = buildUserMessage(agent, inputs)

    PROVIDERS.forEach((prov) => {
      runAgent({
        provider: prov.id,
        model: prov.model,
        apiKey: apiKeys[prov.id],
        systemPrompt: agent.systemPrompt,
        userMessage,
      })
        .then((result) => {
          setResults((prev) => ({
            ...prev,
            [prov.id]: {
              loading: false,
              content: result.content,
              error: null,
              duration: result.duration,
            },
          }))
        })
        .catch((err) => {
          setResults((prev) => ({
            ...prev,
            [prov.id]: {
              loading: false,
              content: null,
              error: err.message || 'An unknown error occurred',
              duration: null,
            },
          }))
        })
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePickWinner = (providerId) => {
    const prov = PROVIDERS.find((p) => p.id === providerId)
    navigate('/battle/winner', {
      state: {
        provider: prov,
        content: results[providerId].content,
        duration: results[providerId].duration,
        agentName: agent?.name,
      },
    })
  }

  if (!agent) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white battle-page-transition">
      <BattleNavbar />

      <main className="pt-14 px-4 py-8">
        {/* Back */}
        <button
          onClick={() => navigate('/battle/setup')}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white 
            transition-all duration-200 hover:gap-2 mb-8"
        >
          <ArrowLeft size={14} />
          Back to Setup
        </button>

        {/* Header */}
        <div className="text-center mb-10 battle-fade-in">
          <h1 className="text-3xl font-extrabold tracking-wider mb-2 text-white">
            Battle Arena
          </h1>
          <p className="text-sm text-gray-300">
            Running <span className="text-white font-semibold">{agent.name}</span> across three providers
          </p>
        </div>

        {/* Three Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {PROVIDERS.map((prov, idx) => {
            const r = results[prov.id]
            return (
              <div
                key={prov.id}
                className={`rounded-xl border ${prov.borderClass} bg-gray-900/50 backdrop-blur-sm
                  shadow-lg flex flex-col battle-fade-in transition-all duration-300`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Column Header */}
                <div className={`flex items-center gap-2.5 px-5 py-4 rounded-t-xl ${prov.headerBg}`}>
                  <Cpu size={16} className={prov.textColor} />
                  <span className={`text-sm font-bold ${prov.textColor} tracking-wide`}>{prov.label}</span>
                  {r.duration && (
                    <span className="ml-auto text-[11px] text-gray-400 font-medium">
                      {(r.duration / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-5 overflow-y-auto max-h-[60vh]">
                  {r.loading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Loader2 size={28} className={`animate-spin ${prov.loaderColor}`} />
                      <span className="text-xs text-gray-400 font-medium">
                        {prov.label} is generating...
                      </span>
                    </div>
                  )}

                  {r.error && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <AlertCircle size={24} className="text-red-400" />
                      </div>
                      <p className="text-xs text-red-400 max-w-xs font-medium">{r.error}</p>
                    </div>
                  )}

                  {r.content && (
                    <div className="markdown-output text-sm text-gray-100 leading-relaxed">
                      {agent.outputType === 'markdown' ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {r.content}
                        </ReactMarkdown>
                      ) : (
                        <pre className="whitespace-pre-wrap font-sans">
                          {r.content}
                        </pre>
                      )}
                    </div>
                  )}
                </div>

                {/* Pick Winner Button */}
                {r.content && !r.loading && (
                  <div className="p-5 border-t border-gray-800/50">
                    <button
                      onClick={() => handlePickWinner(prov.id)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                        text-xs font-bold border-2 transition-all duration-200 active:scale-95
                        ${prov.btnBg}`}
                    >
                      <Trophy size={14} />
                      Pick Winner
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
