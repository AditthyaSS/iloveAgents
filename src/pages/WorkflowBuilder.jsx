import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  X,
  ArrowRight,
  Zap,
  Save,
  Bot,
  ChevronDown,
  GitBranch,
} from 'lucide-react'
import * as Icons from 'lucide-react'
import { loadAllAgents } from '../agents/registry'
import { saveWorkflow } from '../hooks/useWorkflows'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const MAX_AGENTS = 5

export default function WorkflowBuilder() {
  const navigate = useNavigate()
  const location = useLocation()
  const forkedWorkflow = location.state?.forkedWorkflow
  useDocumentTitle('Build a Workflow')

  const [agents, setAgents] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const descriptionRef = useRef(null)
  const [selectedAgents, setSelectedAgents] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasResolvedPreselected, setHasResolvedPreselected] = useState(false)

  useEffect(() => {
    loadAllAgents().then(setAgents)
  }, [])

  // Resolve pre-populated chain once agents load
  useEffect(() => {
    if (!hasResolvedPreselected && agents.length > 0 && location.state?.preselectedAgents) {
      const preselected = location.state.preselectedAgents
      const loaded = preselected
        .map((id) => agents.find((a) => a.id === id))
        .filter(Boolean)
      if (loaded.length > 0) {
        setSelectedAgents(loaded)
      }
      setHasResolvedPreselected(true)
    }
  }, [agents, location.state?.preselectedAgents, hasResolvedPreselected])

  // Pre-populate fields if forking an existing workflow
  useEffect(() => {
    if (forkedWorkflow && agents.length > 0) {
      setTitle(`Copy of ${forkedWorkflow.title}`)
      setDescription(forkedWorkflow.description || '')
      const loaded = (forkedWorkflow.agents || [])
        .map((id) => agents.find((a) => a.id === id))
        .filter(Boolean)
      setSelectedAgents(loaded)
    }
  }, [forkedWorkflow, agents])

  // Agents already in the chain — prevent duplicates
  const selectedIds = new Set(selectedAgents.map((a) => a.id))
  const availableAgents = agents.filter((a) => !selectedIds.has(a.id))

  // Filter agents based on search query
  const filteredAgents = availableAgents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addAgent = (agent) => {
    if (selectedAgents.length >= MAX_AGENTS) return
    setSelectedAgents((prev) => [...prev, agent])
    setDropdownOpen(false)
    setSearchQuery('')
  }

  const removeAgent = (index) => {
    setSelectedAgents((prev) => prev.filter((_, i) => i !== index))
  }

  const canSave = title.trim() && selectedAgents.length >= 1
  const estimatedRuntime = selectedAgents.length * 20

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    const { data, error: saveError } = await saveWorkflow({
      title: title.trim(),
      description: description.trim(),
      agents: selectedAgents.map((a) => a.id),
    })
    setSaving(false)
    if (saveError) {
      setError('Failed to save workflow. Check your Supabase connection.')
      return
    }
    navigate('/workflows')
  }

  const handleRunWithoutSaving = () => {
    if (!canSave) return
    navigate('/workflows/preview/run', {
      state: {
        workflow: {
          id: null,
          title: title.trim(),
          description: description.trim(),
          agents: selectedAgents.map((a) => a.id),
        },
        initialInput: location.state?.preFilledOutput || '',
      },
    })
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/workflows')}
          className="p-1.5 rounded-md transition-colors
            dark:hover:bg-surface-hover dark:text-text-secondary
            hover:bg-gray-100 text-gray-500"
          aria-label="Back to workflows"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <GitBranch size={16} className="text-accent" />
          </div>
          <div>
            <h1 className="text-base font-bold dark:text-text-primary text-gray-900">
              Build a Workflow
            </h1>
            <p className="text-[11px] dark:text-text-muted text-gray-400">
              Chain up to {MAX_AGENTS} agents in sequence
            </p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1.5">
          Workflow Title <span className="text-red-400">*</span>
        </label>
        <input
          id="workflow-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Research → Summary → LinkedIn Post"
          className="w-full px-3 py-2.5 rounded-lg border text-sm transition-all
            dark:bg-surface-card dark:border-border dark:text-text-primary dark:placeholder-text-muted
            bg-white border-gray-200 text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
        />
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1.5">
          Description <span className="dark:text-text-muted text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="relative">
  <textarea
    ref={descriptionRef}
    id="workflow-description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="What does this workflow do?"
    rows={2}
   className="w-full px-3 pr-10 py-2.5 rounded-lg border text-sm transition-all resize-none
      dark:bg-surface-card dark:border-border dark:text-text-primary dark:placeholder-text-muted
      bg-white border-gray-200 text-gray-900 placeholder-gray-400
      focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
  />

  {description.trim() && (
    <button
      type="button"
      onClick={() => {
        setDescription('')
        descriptionRef.current?.focus()
      }}
      className="absolute top-2 right-2 p-1 rounded text-gray-400 hover:text-gray-600 dark:text-text-muted dark:hover:text-text-primary"
      aria-label="Clear description"
    >
      <X size={14} />
    </button>
  )}
</div>

<div className="mt-1 text-xs text-right dark:text-text-muted text-gray-500">
  {description.length} characters
</div>
      </div>

      {/* Agent Sequence Builder */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium dark:text-text-secondary text-gray-600">
            Agent Sequence <span className="text-red-400">*</span>
          </label>
          <span className="text-[11px] dark:text-text-muted text-gray-400">
            {selectedAgents.length}/{MAX_AGENTS} agents
          </span>
        </div>

        {/* Chain Preview */}
        {selectedAgents.length > 0 && (
          <div className="mb-4 space-y-2">
            {selectedAgents.map((agent, index) => {
              const IconComponent = Icons[agent.icon] || Icons.Bot
              return (
                <div key={`${agent.id}-${index}`} className="animate-fade-in">
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg border
                      dark:bg-surface-card dark:border-border bg-white border-gray-200"
                  >
                    {/* Step number */}
                    <div
                      className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center
                        text-[11px] font-bold text-accent flex-shrink-0"
                    >
                      {index + 1}
                    </div>

                    {/* Agent icon */}
                    <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent size={15} className="text-accent" />
                    </div>

                    {/* Agent info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium dark:text-text-primary text-gray-900 truncate">
                        {agent.name}
                      </div>
                      <div className="text-[11px] dark:text-text-muted text-gray-400 truncate">
                        {agent.category}
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeAgent(index)}
                      className="p-1 rounded-md transition-colors flex-shrink-0
                        dark:hover:bg-surface-hover dark:text-text-muted hover:text-red-400
                        hover:bg-red-50 text-gray-400"
                      aria-label={`Remove ${agent.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Arrow connector */}
                  {index < selectedAgents.length - 1 && (
                    <div className="flex justify-center my-1">
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-px h-2 dark:bg-border bg-gray-200" />
                        <ArrowRight size={12} className="dark:text-text-muted text-gray-400 rotate-90" />
                        <div className="text-[9px] dark:text-text-muted text-gray-400 font-medium tracking-wide">
                          output feeds in
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Add Agent Dropdown */}
        {selectedAgents.length < MAX_AGENTS && (
          <div className="relative">
            <button
              id="add-agent-btn"
              onClick={() => setDropdownOpen((o) => !o)}
              className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border
                text-sm font-semibold transition-all duration-200
                dark:bg-surface-card dark:border-border dark:text-text-secondary
                dark:hover:border-accent/40 dark:hover:text-text-primary
                bg-white border-gray-200 text-gray-600 hover:border-accent/30 hover:text-gray-900
                focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            >
              <span className="flex items-center gap-2">
                <Plus size={14} className="text-accent" />
                Add {selectedAgents.length === 0 ? 'first' : 'next'} agent
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform dark:text-text-muted text-gray-400 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div
                className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-lg border shadow-xl
                  dark:bg-surface-card dark:border-border bg-white border-gray-200
                  max-h-64 overflow-y-auto animate-fade-in p-1.5 space-y-1"
              >
                {/* 🔍 STICKY SEARCH BAR INPUT */}
                <div className="p-1.5 sticky top-0 bg-white dark:bg-surface-card border-b border-gray-100 dark:border-border/60 z-10 mb-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search agents by name or category..."
                    className="w-full px-3 py-2 rounded-md border text-xs transition-all duration-200
                      dark:bg-surface-input dark:border-border dark:text-text-primary dark:placeholder-text-muted
                      bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>

                {filteredAgents.length === 0 ? (
                  <div className="px-4 py-3 text-sm dark:text-text-muted text-gray-400 text-center">
                    No agents found
                  </div>
                ) : (
                  <>
  {filteredAgents.map((agent) => {
    const IconComponent = Icons[agent.icon] || Icons.Bot

    return (
      <button
        key={agent.id}
        onClick={() => addAgent(agent)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors duration-150
          dark:hover:bg-surface-hover dark:hover:text-text-primary
          hover:bg-gray-50 hover:text-gray-900"
      >
        <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
          <IconComponent size={13} className="text-accent" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium dark:text-text-primary text-gray-900 truncate">
            {agent.name}
          </div>

          <div className="text-[11px] dark:text-text-muted text-gray-400 truncate">
            {agent.category}
          </div>
        </div>
      </button>
    )
  })}

  <div className="h-3" />
</>
                )}
              </div>
            )}
          </div>
        )}

        {selectedAgents.length === 0 && (
          <p className="mt-2 text-[11px] dark:text-text-muted text-gray-400 flex items-center gap-1">
            <Bot size={11} />
            Add at least one agent to build a workflow
          </p>
        )}
      </div>

      {/* Workflow Preview */}
      {selectedAgents.length > 0 && (
        <div
          className="mb-6 rounded-lg border p-4
            dark:bg-surface-card dark:border-border bg-white border-gray-200"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400 mb-3">
            Workflow Preview
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedAgents.map((agent, index) => (
              <span key={`${agent.id}-preview-${index}`} className="flex items-center gap-1.5">
                <span
                  className="text-xs font-medium px-2 py-1 rounded-md
                    dark:bg-surface-input dark:text-text-secondary dark:border-border
                    bg-gray-100 text-gray-700 border border-gray-200"
                >
                  {agent.name}
                </span>
                {index < selectedAgents.length - 1 && (
                  <ArrowRight size={12} className="dark:text-text-muted text-gray-400 flex-shrink-0" />
                )}
              </span>
            ))}
          </div>
          {selectedAgents.length > 1 && (
            <p className="mt-2 text-[11px] dark:text-text-muted text-gray-400">
              Output of each agent becomes input for the next
            </p>
          )}
        </div>
      )}

      {/* Workflow Summary */}
{(title.trim() || description.trim() || selectedAgents.length > 0) && (
  <div
    className="mb-6 rounded-lg border p-4
      dark:bg-surface-card dark:border-border
      bg-white border-gray-200"
  >
    <div className="text-[11px] font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400 mb-3">
      Workflow Summary
    </div>

    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="dark:text-text-muted text-gray-500">Title</span>
       <span
         className="font-medium dark:text-text-primary text-gray-900 max-w-[60%] text-right break-words"
      >
  {title.trim() || "Not provided"}
</span>
      </div>

      <div className="flex justify-between">
        <span className="dark:text-text-muted text-gray-500">
          Description
        </span>
        <span
  className="font-medium dark:text-text-primary text-gray-900 max-w-[60%] text-right break-words"
>
  {description.trim() || "Not provided"}
</span>
      </div>

      <div className="flex justify-between">
        <span className="dark:text-text-muted text-gray-500">
          Agents Selected
        </span>
        <span className="font-medium dark:text-text-primary text-gray-900">
          {selectedAgents.length}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="dark:text-text-muted text-gray-500">
          Execution Flow
        </span>
        <span className="font-medium dark:text-text-primary text-gray-900">
          Sequential
        </span>
      </div>

      <div className="flex justify-between">
        <span className="dark:text-text-muted text-gray-500">
          Estimated Runtime
        </span>
        <span className="font-medium text-accent">
          ~{estimatedRuntime} sec
        </span>
      </div>
    </div>
  </div>
)}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg border bg-red-500/10 border-red-500/30 text-red-400 text-xs animate-fade-in">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          id="save-workflow-btn"
          onClick={handleSave}
          disabled={!canSave || saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white
            bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200 active:scale-[0.98]"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={15} />
              Save Workflow
            </>
          )
          }
        </button>

        <button
          id="run-without-saving-btn"
          onClick={handleRunWithoutSaving}
          disabled={!canSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
            dark:bg-surface-card dark:border-border dark:text-text-primary dark:hover:border-accent/40
            bg-white border border-gray-200 text-gray-700 hover:border-indigo-300
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200 active:scale-[0.98]"
        >
          <Zap size={15} className="text-accent" />
          Run Without Saving
        </button>
      </div>
    </div>
  )
}