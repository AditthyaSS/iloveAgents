import { useState, useEffect } from 'react'
import { X, Clock, Zap, AlertCircle, ShieldCheck, Mail, Lock } from 'lucide-react'
import { SCHEDULE_PRESETS, createAutomation } from '../lib/automationsService'
import { MODEL_MAP, MODELS } from '../lib/resolveAgentModel'

/**
 * ScheduleAgentModal
 */
export default function ScheduleAgentModal({
  agent,
  inputs,
  provider,
  apiKey,
  onSchedule,
  onClose,
}) {
  const [label, setLabel] = useState(`${agent.name} Autopilot`)
  const [schedule, setSchedule] = useState('daily')
  const [selectedModel, setSelectedModel] = useState(MODEL_MAP[provider] || MODEL_MAP.openai)
  const [keyOverride, setKeyOverride] = useState(apiKey || '')
  const [emailNotification, setEmailNotification] = useState(false)
  const [notificationEmail, setNotificationEmail] = useState('')
  const [optInConsent, setOptInConsent] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const missingRequiredInputs = agent.inputs?.filter((input) => {
    if (!input.required) return false
    const value = inputs[input.id]
    if (Array.isArray(value)) return value.length === 0
    return !value || String(value).trim() === ''
  }) || []

  const handleConfirm = async () => {
    if (!label.trim()) { setError('Please give this schedule a name.'); return }
    if (missingRequiredInputs.length > 0) { setError('Fill all required inputs before scheduling.'); return }
    if (!keyOverride.trim()) { setError('An API key is required to run scheduled jobs.'); return }
    if (!optInConsent) { setError('Please check the opt-in consent for encrypted storage.'); return }
    if (emailNotification && !notificationEmail.trim()) { setError('Please enter a recipient email address.'); return }
    
    setError('')
    setSaving(true)
    try {
      await createAutomation({
        name: label.trim(),
        agentId: agent.id,
        agentName: agent.name,
        category: agent.category,
        provider,
        model: selectedModel,
        schedule,
        inputs: { ...inputs },
        systemPrompt: agent.systemPrompt,
        apiKey: keyOverride.trim(),
        emailNotification,
        notificationEmail: notificationEmail.trim(),
      })

      if (onSchedule) {
        onSchedule({
          label: label.trim(),
          schedule,
          model: selectedModel,
          apiKey: keyOverride.trim(),
          provider,
        })
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save automation')
    } finally {
      setSaving(false)
    }
  }

  const modelsForProvider = MODELS[provider] || MODELS.openai

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Schedule agent autopilot">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl animate-fade-in
        dark:bg-[#12131a] dark:border dark:border-border bg-white border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b dark:border-border border-gray-100 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-accent" />
            <h2 className="text-base font-bold dark:text-text-primary text-gray-900">
              Schedule Agent Autopilot
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md dark:hover:bg-surface-hover hover:bg-gray-100 transition-colors
              dark:text-text-muted text-gray-400"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Agent info */}
          <div className="flex items-center gap-3 p-3 rounded-xl dark:bg-surface-hover bg-gray-50">
            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent flex-shrink-0">
              <Zap size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold dark:text-text-primary text-gray-900 truncate">{agent.name}</p>
              <p className="text-[11px] dark:text-text-muted text-gray-400">
                {Object.keys(inputs).filter(k => inputs[k]).length} input(s) configured
              </p>
            </div>
          </div>

          {/* Schedule name */}
          <div>
            <label className="block text-xs font-semibold dark:text-text-secondary text-gray-600 mb-1">
              Schedule Name
            </label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Daily SEO Analysis"
              className="w-full h-9 px-3 rounded-lg text-sm transition-colors
                dark:bg-surface-input dark:border-border dark:text-text-primary
                bg-gray-50 border border-gray-200 text-gray-900
                focus:ring-1 focus:ring-accent focus:border-accent outline-none"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-semibold dark:text-text-secondary text-gray-600 mb-1">
              Run Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SCHEDULE_PRESETS.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setSchedule(opt.value)}
                  className={`py-2 rounded-lg text-xs font-medium border transition-all
                    ${schedule === opt.value
                      ? 'border-accent bg-accent/10 text-accent font-semibold'
                      : 'dark:border-border dark:text-text-secondary dark:hover:border-accent/40 border-gray-200 text-gray-600'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-semibold dark:text-text-secondary text-gray-600 mb-1">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="w-full h-9 px-3 rounded-lg text-sm transition-colors
                dark:bg-surface-input dark:border-border dark:text-text-primary
                bg-gray-50 border border-gray-200 text-gray-900
                focus:ring-1 focus:ring-accent focus:border-accent outline-none"
            >
              {modelsForProvider.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* API Key with pgsodium info */}
          <div className="p-3 rounded-xl border dark:border-indigo-500/30 border-indigo-200 bg-indigo-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <ShieldCheck size={14} /> pgsodium Key Storage
              </span>
              <span className="text-[10px] text-indigo-400 font-mono">Encrypted</span>
            </div>
            <div className="relative">
              <input
                type="password"
                value={keyOverride}
                onChange={e => setKeyOverride(e.target.value)}
                placeholder="Enter provider API key"
                className="w-full h-8 pl-8 pr-3 rounded-md text-xs font-mono
                  dark:bg-surface-input dark:border-border dark:text-text-primary
                  bg-white border border-gray-200 text-gray-900 outline-none"
              />
              <Lock size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <label className="flex items-start gap-1.5 cursor-pointer text-[10px] text-gray-500 dark:text-gray-400">
              <input
                type="checkbox"
                checked={optInConsent}
                onChange={e => setOptInConsent(e.target.checked)}
                className="mt-0.5 rounded text-accent"
              />
              <span>Opt-in consent for encrypted key storage for automated autopilot runs.</span>
            </label>
          </div>

          {/* Resend Email Notification */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs font-semibold dark:text-text-secondary text-gray-600">
              <span className="flex items-center gap-1.5"><Mail size={14} className="text-pink-500" /> Email Reports (Resend)</span>
              <input
                type="checkbox"
                checked={emailNotification}
                onChange={e => setEmailNotification(e.target.checked)}
                className="rounded text-accent"
              />
            </label>
            {emailNotification && (
              <input
                type="email"
                value={notificationEmail}
                onChange={e => setNotificationEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full h-8 px-3 rounded-lg text-xs dark:bg-surface-input dark:border-border bg-gray-50 border border-gray-200 outline-none"
              />
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
              <AlertCircle size={13} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-2 border-t dark:border-border/60 border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white
              bg-accent hover:bg-accent-hover transition-all shadow-md active:scale-[0.97]"
          >
            <Clock size={14} />
            {saving ? 'Activating...' : 'Activate Autopilot'}
          </button>
        </div>
      </div>
    </div>
  )
}

