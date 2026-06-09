import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Key, Swords, ArrowLeft, Info, ExternalLink, ShieldCheck } from 'lucide-react'
import { useAgents } from '../lib/useAgents'
import { useApiKey } from '../lib/useApiKey'
import BattleNavbar from '../components/BattleNavbar'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function BattleModeSetup() {
  const navigate = useNavigate()
  const { agents } = useAgents()
  useDocumentTitle('Battle Mode Setup')
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [inputs, setInputs] = useState({})
  const { apiKeys, setApiKeys } = useApiKey()
  const [openHelperId, setOpenHelperId] = useState(null)

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === selectedAgentId),
    [selectedAgentId]
  )

  const handleAgentChange = (agentId) => {
    setSelectedAgentId(agentId)
    const agent = agents.find((a) => a.id === agentId)
    if (!agent) { setInputs({}); return }

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

  const canStart = () => {
    if (!selectedAgent) return false
    if (!apiKeys.openai || !apiKeys.anthropic || !apiKeys.gemini) return false
    return selectedAgent.inputs
      .filter((i) => i.required)
      .every((i) => {
        const v = inputs[i.id]
        if (Array.isArray(v)) return v.length > 0
        return v && v.trim() !== ''
      })
  }

  const handleStart = () => {
    navigate('/battle/arena', {
      state: {
        agent: selectedAgent,
        inputs,
        apiKeys,
      },
    })
  }

  const handleKeyChange = (providerId, value) => {
    setApiKeys((prev) => ({ ...prev, [providerId]: value }))
  }

  const keyFields = [
    {
      id: 'openai',
      label: 'OpenAI API Key',
      colorClass: 'text-yellow-400',
      borderColor: 'border-yellow-400/30',
      focusColor: 'focus:ring-yellow-400/40 focus:border-yellow-400/50',
      focusBg: 'focus:bg-yellow-400/5',
      keyUrl: 'https://platform.openai.com/api-keys',
      helperText: 'Open the OpenAI dashboard, create a new secret key, then paste it here.',
    },
    {
      id: 'anthropic',
      label: 'Anthropic API Key',
      colorClass: 'text-violet-400',
      borderColor: 'border-violet-400/30',
      focusColor: 'focus:ring-violet-400/40 focus:border-violet-400/50',
      focusBg: 'focus:bg-violet-400/5',
      keyUrl: 'https://console.anthropic.com/settings/keys',
      helperText: 'Sign in to Anthropic Console, create an API key, then copy it into Battle Mode.',
    },
    {
      id: 'gemini',
      label: 'Google Gemini API Key',
      colorClass: 'text-blue-400',
      borderColor: 'border-blue-400/30',
      focusColor: 'focus:ring-blue-400/40 focus:border-blue-400/50',
      focusBg: 'focus:bg-blue-400/5',
      keyUrl: 'https://aistudio.google.com/apikey',
      helperText: 'Visit Google AI Studio, generate an API key, and paste it here to enable Gemini.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white battle-page-transition">
      <BattleNavbar />

      <main className="pt-16 max-w-3xl mx-auto px-4 py-12">
        {/* Back */}
        <button
          onClick={() => navigate('/battle')}
          className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white 
              transition-all duration-200 hover:gap-2.5 mb-10"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-10 battle-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/30
            flex items-center justify-center flex-shrink-0">
            <Settings size={24} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-wider text-white">Battle Setup</h1>
            <p className="text-sm text-gray-400 mt-1">Pick an agent, enter your inputs, provide API keys</p>
          </div>
        </div>

        {/* Agent Picker */}
        <div className="mb-10 battle-fade-in" style={{ animationDelay: '100ms' }}>
          <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
            Select Agent
          </label>
          <select
            value={selectedAgentId}
            onChange={(e) => handleAgentChange(e.target.value)}
            className="w-full h-14 px-5 rounded-xl text-base bg-gray-900 border border-gray-700/60
              text-white cursor-pointer focus:ring-1 focus:ring-yellow-400/40 focus:border-yellow-400/50 
              outline-none hover:border-gray-600 transition-all duration-200 battle-select-highlight"
          >
            <option value="" className="bg-gray-900 text-white">
              -- Choose an agent --
            </option>
            {agents.map((a) => (
              <option key={a.id} value={a.id} className="bg-gray-900 text-white">
                {a.name} ({a.category})
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Agent Inputs */}
        {selectedAgent && (
          <div className="mb-10 space-y-6 battle-fade-in" style={{ animationDelay: '150ms' }}>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Agent Inputs
            </h2>
            {selectedAgent.inputs.map((input) => (
              <div key={input.id}>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {input.label}
                  {input.required && <span className="text-red-400 ml-0.5">*</span>}
                </label>

                {input.type === 'text' && (
                  <input
                    type="text"
                    value={inputs[input.id] || ''}
                    onChange={(e) => updateInput(input.id, e.target.value)}
                    placeholder={input.placeholder}
                    className="w-full h-12 px-5 rounded-xl text-base bg-gray-900/60 border border-gray-700/60
                      text-white placeholder:text-gray-500 hover:border-gray-600
                      focus:ring-1 focus:ring-yellow-400/40 focus:border-yellow-400/50 focus:bg-gray-900/80
                      outline-none transition-all duration-200"
                  />
                )}

                {(input.type === 'textarea' || input.type === 'code') && (
                  <textarea
                    value={inputs[input.id] || ''}
                    onChange={(e) => updateInput(input.id, e.target.value)}
                    placeholder={input.placeholder}
                    rows={input.type === 'code' ? 8 : 4}
                    className={`w-full px-5 py-3 rounded-xl text-base bg-gray-900/60 border border-gray-700/60
                      text-white placeholder:text-gray-500 resize-y hover:border-gray-600
                      focus:ring-1 focus:ring-yellow-400/40 focus:border-yellow-400/50 focus:bg-gray-900/80
                      outline-none transition-all duration-200
                      ${input.type === 'code' ? 'font-mono text-sm text-green-300' : ''}`}
                  />
                )}

                {input.type === 'select' && (
                  <select
                    value={inputs[input.id] || input.defaultValue || ''}
                    onChange={(e) => updateInput(input.id, e.target.value)}
                    className="w-full h-12 px-5 rounded-xl text-base bg-gray-900 border border-gray-700/60
                      text-white cursor-pointer hover:border-gray-600
                      focus:ring-1 focus:ring-yellow-400/40 focus:border-yellow-400/50 focus:bg-gray-900
                      outline-none transition-all duration-200"
                  >
                    {input.options?.map((opt) => (
                      <option key={opt} value={opt} className="bg-gray-900 text-white">{opt}</option>
                    ))}
                  </select>
                )}

                {input.type === 'multiselect' && (
                  <div className="flex flex-wrap gap-3">
                    {input.options?.map((opt) => {
                      const selected = (inputs[input.id] || []).includes(opt)
                      return (
                        <button
                          key={opt}
                          onClick={() => toggleMultiselect(input.id, opt)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border
                            ${selected
                              ? 'bg-yellow-400/15 text-yellow-300 border-yellow-400/40'
                              : 'bg-gray-900/60 text-gray-400 border-gray-700/60 hover:border-gray-600 hover:text-gray-300'
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
        )}

        {/* API Keys */}
        <div className="mb-10 space-y-6 battle-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                API Keys
              </h2>
              <p className="mt-2 text-sm text-gray-500 max-w-xl">
                Need a key? Use the info button beside each provider to jump straight to its key page.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-sm text-emerald-200">
              <ShieldCheck size={18} className="text-emerald-300 flex-shrink-0" />
              <span>Keys stay in your browser and are not saved on our servers.</span>
            </div>
          </div>
          {keyFields.map((field) => (
            <div key={field.id}>
              <div className="mb-2 flex items-start justify-between gap-3">
                <label className="block pt-1 text-xs font-medium text-gray-200">
                  {field.label}
                </label>
                <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenHelperId((current) => current === field.id ? null : field.id)}
                    className="inline-flex h-5 w-5 items-center justify-center text-gray-400 transition-colors hover:text-white"
                    aria-label={`How to get a ${field.label}`}
                    aria-expanded={openHelperId === field.id}
                  >
                    <Info size={12} />
                  </button>
                  <a
                    href={field.keyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-gray-500 transition-colors hover:text-white"
                  >
                    Get key
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {openHelperId === field.id && (
                <div className="mb-3 rounded-lg border border-gray-800 bg-gray-900/80 px-3 py-3 text-xs text-gray-300">
                  <p>{field.helperText}</p>
                  <a
                    href={field.keyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 font-medium text-yellow-300 transition-colors hover:text-yellow-200"
                  >
                    Open {field.label} page
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key size={18} className={field.colorClass} />
                </div>
                <input
                  type="password"
                  value={apiKeys[field.id]}
                  onChange={(e) => setApiKeys((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  placeholder={`Enter your ${field.label}...`}
                  className={`w-full h-14 pl-12 pr-5 rounded-xl text-base bg-gray-900/60 border ${field.borderColor}
                    text-white placeholder:text-gray-500 outline-none hover:border-gray-600
                    focus:ring-1 ${field.focusColor} ${field.focusBg}
                    transition-all duration-200`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Start Battle */}
        <button
          onClick={handleStart}
          disabled={!canStart()}
          className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-base font-bold
            bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-950
            hover:from-yellow-400 hover:to-amber-400 transition-all duration-200
            shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:shadow-xl
            active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
            disabled:hover:from-yellow-500 disabled:hover:to-amber-500 disabled:hover:shadow-yellow-500/20
            border border-yellow-400/20 hover:border-yellow-300/40
            battle-fade-in"
          style={{ animationDelay: '300ms' }}
        >
          <Swords size={20} />
          Start Battle
        </button>
      </main>
    </div>
  )
}
