import { useState, useEffect, useRef, useMemo } from 'react'
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

// Category colors and ring highlights for visual consistency
const categoryMeta = {
  Productivity: { color: 'from-blue-500 to-cyan-400',   ring: 'ring-blue-500/30' },
  Research:     { color: 'from-violet-500 to-purple-400', ring: 'ring-violet-500/30' },
  Marketing:    { color: 'from-pink-500 to-rose-400',    ring: 'ring-pink-500/30' },
  Engineering:  { color: 'from-emerald-500 to-green-400', ring: 'ring-emerald-500/30' },
  HR:           { color: 'from-amber-500 to-yellow-400',  ring: 'ring-amber-500/30' },
  Business:     { color: 'from-orange-500 to-amber-400',  ring: 'ring-orange-500/30' },
  Education:    { color: 'from-indigo-500 to-blue-400',   ring: 'ring-indigo-500/30' },
  Legal:        { color: 'from-red-500 to-rose-400',      ring: 'ring-red-500/30' },
  Design:       { color: 'from-fuchsia-500 to-pink-400',  ring: 'ring-fuchsia-500/30' },
  Product:      { color: 'from-teal-500 to-cyan-400',     ring: 'ring-teal-500/30' },
  'Developer Tools': { color: 'from-slate-600 to-slate-400', ring: 'ring-slate-500/30' },
}

const defaultMeta = { color: 'from-gray-500 to-gray-400', ring: 'ring-gray-500/30' }

const MAX_AGENTS = 5

export default function WorkflowBuilder() {
  const navigate = useNavigate()
  const location = useLocation()
  useDocumentTitle('Build a Workflow')

  const [agents, setAgents] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAgents, setSelectedAgents] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [hasResolvedPreselected, setHasResolvedPreselected] = useState(false)

  const searchInputRef = useRef(null)

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

  // Pre-select agent if coming from AgentRunner
  useEffect(() => {
    if (location.state?.preSelectedAgent) {
      const agent = location.state.preSelectedAgent
      setSelectedAgents([agent])
      setTitle(`${agent.name} Workflow`)
      
      // Clear location state to prevent re-adding on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // Agents already in the chain — prevent duplicates
  const selectedIds = new Set(selectedAgents.map((a) => a.id))
  const availableAgents = agents.filter((a) => !selectedIds.has(a.id))

  // Get available categories for the dropdown dynamically, filtering out empty/falsy categories
  const availableCategories = useMemo(() => {
    return [...new Set(
      availableAgents
        .map((a) => (typeof a.category === 'string' ? a.category.trim() : ''))
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b))
  }, [availableAgents])

  // Filter agents based on search query and category
  const filteredAgents = availableAgents.filter((agent) => {
    const q = searchQuery.toLowerCase()
    const name = typeof agent.name === 'string' ? agent.name.toLowerCase() : ''
    const category = typeof agent.category === 'string' ? agent.category.toLowerCase() : ''
    const rawCategory = typeof agent.category === 'string' ? agent.category.trim() : ''
    
    const matchesSearch = name.includes(q) || category.includes(q)
    const matchesCategory = !selectedCategory || rawCategory === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [dropdownOpen])

  // Reset selected category if it's no longer present in available agents
  useEffect(() => {
    if (selectedCategory && !availableAgents.some((a) => (typeof a.category === 'string' ? a.category.trim() : '') === selectedCategory)) {
      setSelectedCategory(null)
    }
  }, [availableAgents, selectedCategory])

  const addAgent = (agent) => {
    if (selectedAgents.length >= MAX_AGENTS) return
    setSelectedAgents((prev) => [...prev, agent])
    setDropdownOpen(false)
    setSearchQuery('')
    setSelectedCategory(null)
  }

  const removeAgent = (index) => {
    setSelectedAgents((prev) => prev.filter((_, i) => i !== index))
  }

  const canSave = title.trim() && selectedAgents.length >= 1

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
        <textarea
          id="workflow-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this workflow do?"
          rows={2}
          className="w-full px-3 py-2.5 rounded-lg border text-sm transition-all resize-none
            dark:bg-surface-card dark:border-border dark:text-text-primary dark:placeholder-text-muted
            bg-white border-gray-200 text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
        />
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
              onClick={() => {
                setDropdownOpen((o) => {
                  const next = !o
                  if (!next) {
                    setSearchQuery('')
                    setSelectedCategory(null)
                  }
                  return next
                })
              }}
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
                {/* 🔍 STICKY SEARCH & FILTER HEADER */}
                <div className="p-1.5 sticky top-0 bg-white dark:bg-surface-card border-b border-gray-100 dark:border-border/60 z-10 mb-1 space-y-1.5">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search agents by name or category..."
                      className="w-full pl-2 pr-7 py-2 rounded-md border text-xs transition-all duration-200
                        dark:bg-surface-input dark:border-border dark:text-text-primary dark:placeholder-text-muted
                        bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-2 flex items-center
                          dark:text-text-muted text-gray-400 hover:text-accent transition-colors"
                        aria-label="Clear search"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Horizontal Scrollable Category Filter Pills */}
                  {availableCategories.length > 0 && (
                    <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none border-t border-gray-50 dark:border-border/30 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(null)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all duration-200 border whitespace-nowrap
                          ${!selectedCategory
                            ? 'bg-accent text-white border-accent shadow-sm'
                            : 'dark:bg-surface-input dark:border-border dark:text-text-secondary dark:hover:border-accent/40 bg-white border-gray-200 text-gray-500 hover:border-accent/30'
                          }`}
                      >
                        All
                      </button>
                      {availableCategories.map((cat) => {
                        const meta = categoryMeta[cat] || defaultMeta
                        const isActive = selectedCategory === cat
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(isActive ? null : cat)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all duration-200 border whitespace-nowrap
                              ${isActive
                                ? `bg-gradient-to-r ${meta.color} text-white border-transparent ring-1 ${meta.ring}`
                                : 'dark:bg-surface-input dark:border-border dark:text-text-secondary dark:hover:border-accent/40 bg-white border-gray-200 text-gray-500 hover:border-accent/30'
                              }`}
                          >
                            {cat}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {filteredAgents.length === 0 ? (
                  <div className="px-4 py-3 text-sm dark:text-text-muted text-gray-400 text-center">
                    No agents found
                  </div>
                ) : (
                  filteredAgents.map((agent) => {
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
                  })
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