import { useState, useEffect } from 'react'
import {
  X, Clock, Zap, ShieldCheck, Mail, AlertCircle, CheckCircle2,
  ChevronDown, Sparkles, Key, Lock, ArrowRight, Layers
} from 'lucide-react'
import { SCHEDULE_PRESETS, createAutomation, updateAutomation } from '../lib/automationsService'
import { MODEL_MAP, MODELS } from '../lib/resolveAgentModel'
import { useAgents } from '../lib/useAgents'
import { useApiKey } from '../lib/useApiKey'

export default function CreateAutomationModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedAgent = null,
  initialData = null, // for editing
}) {
  const { apiKey: globalKey } = useApiKey()
  const { agents } = useAgents()
  const [selectedAgentId, setSelectedAgentId] = useState(
    initialData?.agentId || preselectedAgent?.id || ''
  )
  const [name, setName] = useState(initialData?.name || '')
  const [schedule, setSchedule] = useState(initialData?.schedule || 'daily')
  const [provider, setProvider] = useState(initialData?.provider || 'openai')
  const [selectedModel, setSelectedModel] = useState(initialData?.model || 'gpt-4o')
  const [apiKey, setApiKey] = useState(initialData?.apiKey || globalKey || '')
  const [inputs, setInputs] = useState(initialData?.inputs || {})
  const [emailNotification, setEmailNotification] = useState(initialData?.emailNotification ?? true)
  const [notificationEmail, setNotificationEmail] = useState(initialData?.notificationEmail || '')
  const [optInEncryptedConsent, setOptInEncryptedConsent] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchAgent, setSearchAgent] = useState('')

  useEffect(() => {
    if (!selectedAgentId && agents.length > 0 && !preselectedAgent) {
      setSelectedAgentId(agents[0].id)
    }
  }, [agents])

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || preselectedAgent

  // Update defaults when agent changes
  useEffect(() => {
    if (selectedAgent && !initialData) {
      if (!name || name.endsWith('Automation')) {
        setName(`${selectedAgent.name} Autopilot`)
      }
      const initialInputs = {}
      selectedAgent.inputs?.forEach(inp => {
        initialInputs[inp.id] = inp.defaultValue || (inp.type === 'multiselect' ? [] : '')
      })
      setInputs(initialInputs)

      const prov = selectedAgent.provider === 'any' ? 'openai' : selectedAgent.provider
      setProvider(prov)
      setSelectedModel(MODEL_MAP[prov] || MODEL_MAP.openai)
    }
  }, [selectedAgentId, selectedAgent])

  if (!isOpen) return null

  const handleInputChange = (id, val) => {
    setInputs(prev => ({ ...prev, [id]: val }))
  }

  const handleToggleMultiselect = (id, opt) => {
    setInputs(prev => {
      const cur = prev[id] || []
      return {
        ...prev,
        [id]: cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt],
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please provide a name for this automation.')
      return
    }
    if (!selectedAgent) {
      setError('Please select an agent.')
      return
    }
    if (!apiKey.trim() && !initialData?.hasKey) {
      setError('An API key is required to run background automations.')
      return
    }
    if (!optInEncryptedConsent) {
      setError('Please opt-in to encrypted key storage to enable automated runs.')
      return
    }
    if (emailNotification && !notificationEmail.trim()) {
      setError('Please enter a recipient email for execution reports.')
      return
    }

    setLoading(true)
    try {
      if (initialData) {
        await updateAutomation(initialData.id, {
          name: name.trim(),
          schedule,
          inputs,
          provider,
          model: selectedModel,
          apiKey: apiKey.trim() || undefined,
          emailNotification,
          notificationEmail: notificationEmail.trim(),
        })
      } else {
        await createAutomation({
          name: name.trim(),
          agentId: selectedAgent.id,
          agentName: selectedAgent.name,
          category: selectedAgent.category,
          provider,
          model: selectedModel,
          schedule,
          inputs,
          systemPrompt: selectedAgent.systemPrompt,
          apiKey: apiKey.trim(),
          emailNotification,
          notificationEmail: notificationEmail.trim(),
        })
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save automation')
    } finally {
      setLoading(false)
    }
  }

  const filteredAgents = agents.filter(a =>
    a.name.toLowerCase().includes(searchAgent.toLowerCase()) ||
    a.category.toLowerCase().includes(searchAgent.toLowerCase())
  )

  const modelsForProvider = MODELS[provider] || MODELS.openai

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl my-8 rounded-2xl shadow-2xl border transition-all
        dark:bg-[#12131a] dark:border-border/80 bg-white border-gray-200 text-gray-900 dark:text-gray-100 overflow-hidden z-10">

        {/* Header with Gradient Accent */}
        <div className="relative px-6 py-5 border-b dark:border-border/60 border-gray-100 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-inner">
                <Clock size={20} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  {initialData ? 'Edit Scheduled Automation' : 'Schedule AI Agent Autopilot'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recurring execution, pgsodium encrypted keys & Resend email reports
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-hover transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Automation Name & Agent Selector */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Automation Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Daily Tech SEO Audit & Content Recommendations"
                className="w-full h-10 px-3.5 rounded-xl text-sm transition-all
                  dark:bg-surface-input dark:border-border dark:text-text-primary
                  bg-gray-50 border border-gray-200 text-gray-900
                  focus:ring-2 focus:ring-accent/40 focus:border-accent outline-none"
              />
            </div>

            {!initialData && !preselectedAgent && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                  Select AI Agent ({agents.length} available)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Search agents by name or category..."
                    value={searchAgent}
                    onChange={e => setSearchAgent(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-lg dark:bg-surface-hover dark:border-border/60 bg-gray-100 border border-gray-200 outline-none"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 border rounded-xl dark:border-border/60 border-gray-200">
                    {filteredAgents.map(a => (
                      <button
                        type="button"
                        key={a.id}
                        onClick={() => setSelectedAgentId(a.id)}
                        className={`p-2.5 rounded-lg text-left text-xs transition-all border flex items-start justify-between gap-2
                          ${selectedAgentId === a.id
                            ? 'border-accent bg-accent/15 text-accent font-semibold shadow-sm'
                            : 'border-transparent dark:hover:bg-surface-hover hover:bg-gray-100 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        <div className="truncate">
                          <p className="font-medium truncate">{a.name}</p>
                          <span className="text-[10px] opacity-70">{a.category}</span>
                        </div>
                        {selectedAgentId === a.id && <CheckCircle2 size={14} className="shrink-0 text-accent mt-0.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedAgent && (
              <div className="p-3.5 rounded-xl border dark:border-border/60 border-gray-200 dark:bg-surface-card/60 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent shrink-0">
                    <Zap size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{selectedAgent.name}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{selectedAgent.description}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/15 text-accent shrink-0 ml-2">
                  {selectedAgent.category}
                </span>
              </div>
            )}
          </div>

          {/* Section 2: Agent Dynamic Inputs */}
          {selectedAgent?.inputs?.length > 0 && (
            <div className="space-y-3 pt-2 border-t dark:border-border/60 border-gray-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  Configured Inputs
                </label>
                <span className="text-[11px] text-gray-400">These inputs will be fed on every recurring trigger</span>
              </div>

              <div className="space-y-3">
                {selectedAgent.inputs.map(inp => (
                  <div key={inp.id} className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      {inp.label}
                      {inp.required && <span className="text-red-400">*</span>}
                    </label>

                    {inp.type === 'textarea' || inp.type === 'code' ? (
                      <textarea
                        rows={3}
                        value={inputs[inp.id] || ''}
                        onChange={e => handleInputChange(inp.id, e.target.value)}
                        placeholder={inp.placeholder || `Enter ${inp.label.toLowerCase()}...`}
                        className="w-full p-2.5 rounded-xl text-xs font-mono dark:bg-surface-input dark:border-border bg-gray-50 border border-gray-200 outline-none focus:ring-1 focus:ring-accent"
                      />
                    ) : inp.type === 'multiselect' ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {inp.options?.map(opt => {
                          const isSel = (inputs[inp.id] || []).includes(opt)
                          return (
                            <button
                              type="button"
                              key={opt}
                              onClick={() => handleToggleMultiselect(inp.id, opt)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                isSel
                                  ? 'bg-accent/15 text-accent border-accent/40 font-semibold'
                                  : 'dark:bg-surface-input dark:border-border border-gray-200 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                              }`}
                            >
                              {isSel ? '✓ ' : ''}{opt}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={inputs[inp.id] || ''}
                        onChange={e => handleInputChange(inp.id, e.target.value)}
                        placeholder={inp.placeholder || `Enter ${inp.label.toLowerCase()}...`}
                        className="w-full h-9 px-3 rounded-xl text-xs dark:bg-surface-input dark:border-border bg-gray-50 border border-gray-200 outline-none focus:ring-1 focus:ring-accent"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Schedule Recurrence */}
          <div className="space-y-2 pt-2 border-t dark:border-border/60 border-gray-100">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Recurring Autopilot Interval
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SCHEDULE_PRESETS.map(preset => (
                <button
                  type="button"
                  key={preset.value}
                  onClick={() => setSchedule(preset.value)}
                  className={`p-3 rounded-xl border text-left transition-all relative
                    ${schedule === preset.value
                      ? 'border-accent bg-accent/10 dark:bg-accent/15 text-accent shadow-md shadow-accent/10 font-semibold'
                      : 'border-gray-200 dark:border-border/80 dark:bg-surface-card bg-white text-gray-700 dark:text-gray-300 hover:border-accent/40'
                    }`}
                >
                  <p className="text-xs font-bold">{preset.label}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{preset.description}</p>
                  <span className="inline-block mt-2 font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                    {preset.cron}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Model & Provider Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t dark:border-border/60 border-gray-100">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Model Provider
              </label>
              <select
                value={provider}
                onChange={e => {
                  setProvider(e.target.value)
                  setSelectedModel(MODEL_MAP[e.target.value] || MODEL_MAP.openai)
                }}
                className="w-full h-10 px-3 rounded-xl text-xs font-medium dark:bg-surface-input dark:border-border bg-gray-50 border border-gray-200 outline-none"
              >
                <option value="openai">OpenAI (GPT-4o, o3-mini)</option>
                <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                <option value="gemini">Google Gemini (Gemini 1.5 Pro / Flash)</option>
                <option value="openrouter">OpenRouter (DeepSeek / Llama 3)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full h-10 px-3 rounded-xl text-xs font-medium dark:bg-surface-input dark:border-border bg-gray-50 border border-gray-200 outline-none"
              >
                {modelsForProvider.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 5: Encrypted Key Storage (pgsodium guarantee) */}
          <div className="p-4 rounded-xl border dark:border-indigo-500/30 border-indigo-200 bg-indigo-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-500" />
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  pgsodium Encrypted Provider Key
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                Zero Plaintext Leakage
              </span>
            </div>

            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={initialData?.hasKey ? '•••••••••••••••• (Key saved and encrypted)' : `Enter ${provider} API Key...`}
                className="w-full h-10 pl-9 pr-3 rounded-xl text-xs font-mono dark:bg-[#0c0d12] dark:border-border bg-white border border-gray-200 outline-none focus:ring-1 focus:ring-accent"
              />
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={optInEncryptedConsent}
                onChange={e => setOptInEncryptedConsent(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-accent focus:ring-accent"
              />
              <span className="text-[11px] text-gray-600 dark:text-gray-400 leading-tight">
                <strong>Explicit Opt-in Consent:</strong> I authorize encrypting and storing this key server-side using Supabase pgsodium encryption exclusively to execute scheduled background runs for this automation.
              </span>
            </label>
          </div>

          {/* Section 6: Resend Email Notification */}
          <div className="p-4 rounded-xl border dark:border-border/70 border-gray-200 dark:bg-surface-card/60 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-pink-500" />
                <span className="text-xs font-bold">Resend Email Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotification}
                  onChange={e => setEmailNotification(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-accent"></div>
              </label>
            </div>

            {emailNotification && (
              <div className="animate-fade-in space-y-1">
                <label className="block text-[11px] text-gray-500 dark:text-gray-400">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={e => setNotificationEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-9 px-3 rounded-lg text-xs dark:bg-surface-input dark:border-border bg-white border border-gray-200 outline-none focus:ring-1 focus:ring-accent"
                />
                <p className="text-[10px] text-gray-400">
                  Formatted execution markdown reports and run diagnostics will be sent directly to your inbox upon execution.
                </p>
              </div>
            )}
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-border/60 border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold rounded-xl text-white
                bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500
                hover:opacity-95 shadow-lg shadow-indigo-500/25 active:scale-98 transition-all flex items-center gap-2"
            >
              {loading ? (
                <span>Saving Automation...</span>
              ) : (
                <>
                  <span>{initialData ? 'Save Changes' : 'Activate Autopilot'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
