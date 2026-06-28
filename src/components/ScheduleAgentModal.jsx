import { useState } from 'react'
import { X, Clock, Zap, AlertCircle } from 'lucide-react'
import { SCHEDULE_OPTIONS } from '../lib/useScheduler'
import { MODEL_MAP, MODELS } from '../lib/resolveAgentModel'

/**
 * ScheduleAgentModal
 *
 * Props:
 *   agent      — full agent definition object
 *   inputs     — current inputs object from AgentRunner
 *   provider   — currently selected provider
 *   apiKey     — current API key
 *   onSchedule — fn({ label, schedule, model, apiKey, provider }) called on confirm
 *   onClose    — fn() to close the modal
 */
export default function ScheduleAgentModal({
  agent,
  inputs,
  provider,
  apiKey,
  onSchedule,
  onClose,
}) {
  const [label, setLabel] = useState(`${agent.name} — scheduled`)
  const [schedule, setSchedule] = useState('daily')
  const [selectedModel, setSelectedModel] = useState(MODEL_MAP[provider] || MODEL_MAP.openai)
  const [keyOverride, setKeyOverride] = useState(apiKey || '')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (!label.trim()) { setError('Please give this schedule a name.'); return }
    if (!keyOverride.trim()) { setError('An API key is required to run scheduled jobs.'); return }
    setError('')
    onSchedule({
      label: label.trim(),
      schedule,
      model: selectedModel,
      apiKey: keyOverride.trim(),
      provider,
    })
    onClose()
  }

  const modelsForProvider = MODELS[provider] || MODELS.openai

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl animate-fade-in
        dark:bg-surface-card dark:border dark:border-border bg-white border border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b dark:border-border border-gray-100">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-accent" />
            <h2 className="text-base font-bold dark:text-text-primary text-gray-900">
              Schedule Agent
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
        <div className="px-5 py-4 space-y-4">
          {/* Agent info */}
          <div className="flex items-center gap-3 p-3 rounded-lg dark:bg-surface-hover bg-gray-50">
            <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Zap size={15} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold dark:text-text-primary text-gray-900">{agent.name}</p>
              <p className="text-[11px] dark:text-text-muted text-gray-400">
                {Object.keys(inputs).filter(k => inputs[k]).length} input(s) saved
              </p>
            </div>
          </div>

          {/* Schedule name */}
          <div>
            <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1.5">
              Schedule name
            </label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Daily competitor analysis"
              className="w-full h-9 px-3 rounded-md text-sm transition-colors
                dark:bg-surface-input dark:border-border dark:text-text-primary dark:placeholder:text-text-muted
                bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400
                focus:ring-1 focus:ring-accent focus:border-accent outline-none"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1.5">
              Run frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SCHEDULE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSchedule(opt.value)}
                  className={`py-2 rounded-lg text-xs font-medium border transition-all
                    ${schedule === opt.value
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'dark:border-border dark:text-text-secondary dark:hover:border-accent/40 border-gray-200 text-gray-600 hover:border-indigo-300'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1.5">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="w-full h-9 px-3 rounded-md text-sm transition-colors
                dark:bg-surface-input dark:border-border dark:text-text-primary
                bg-gray-50 border border-gray-200 text-gray-900
                focus:ring-1 focus:ring-accent focus:border-accent outline-none"
            >
              {modelsForProvider.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1.5">
              API Key <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={keyOverride}
              onChange={e => setKeyOverride(e.target.value)}
              placeholder="Stored locally, never sent to our servers"
              className="w-full h-9 px-3 rounded-md text-sm transition-colors
                dark:bg-surface-input dark:border-border dark:text-text-primary dark:placeholder:text-text-muted
                bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400
                focus:ring-1 focus:ring-accent focus:border-accent outline-none"
            />
            <p className="mt-1 text-[10px] dark:text-text-muted text-gray-400">
              Stored in your browser's localStorage only. Never sent to any server except the AI provider.
            </p>
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
        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors
              dark:text-text-secondary dark:hover:bg-surface-hover text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white
              bg-accent hover:bg-accent-hover transition-all duration-150 active:scale-[0.97]"
          >
            <Clock size={14} />
            Schedule
          </button>
        </div>
      </div>
    </div>
  )
}
