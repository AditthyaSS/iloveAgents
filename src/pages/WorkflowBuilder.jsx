import { useState, useEffect } from 'react'
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
  Loader2,
} from 'lucide-react'
import * as Icons from 'lucide-react'
import agents from '../agents/registry'
import MCPStepCard from '../components/MCPStepCard'
import { listMCPServers } from '../data/mcpRegistry'
import { saveWorkflow } from '../hooks/useWorkflows'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const MAX_STEPS = 5

export default function WorkflowBuilder() {
  const navigate = useNavigate()
  const location = useLocation()
  useDocumentTitle('Build a Workflow')

  // Pre-populate chain when navigating from a SuggestedChainPills click
  const preselected = location.state?.preselectedAgents ?? []
  const initialAgents = preselected
    .map((id) => agents.find((a) => a.id === id))
    .filter(Boolean)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
 main
  const [selectedSteps, setSelectedSteps] = useState([])

  const [selectedAgents, setSelectedAgents] = useState(initialAgents)
 main
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [addingMCPStep, setAddingMCPStep] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

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
  const agentIds = new Set(selectedSteps.filter(s => s.type === 'agent').map((s) => s.id))
  const availableAgents = agents.filter((a) => !agentIds.has(a.id))

  // Filter agents based on search query
  const filteredAgents = availableAgents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addAgent = (agent) => {
    if (selectedSteps.length >= MAX_STEPS) return
    setSelectedSteps((prev) => [...prev, { type: 'agent', id: agent.id, ...agent }])
    setDropdownOpen(false)
    setSearchQuery('')
  }

  const addMCPStep = () => {
    if (selectedSteps.length >= MAX_STEPS) return
    setSelectedSteps((prev) => [...prev, { type: 'mcp', serverId: '', toolId: '', credentials: {}, params: {} }])
    setAddingMCPStep(false)
  }

  const updateMCPStep = (index, config) => {
    setSelectedSteps((prev) => 
      prev.map((s, i) => i === index ? { type: 'mcp', ...config } : s)
    )
  }

  const removeStep = (index) => {
    setSelectedSteps((prev) => prev.filter((_, i) => i !== index))
  }

  const canSave = title.trim() && selectedSteps.length >= 1

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    
    // Convert steps to save format
    const stepsData = selectedSteps.map(step => {
      if (step.type === 'agent') {
        return { type: 'agent', id: step.id }
      } else {
        return { 
          type: 'mcp', 
          serverId: step.serverId, 
          toolId: step.toolId,
          credentials: step.credentials,
          params: step.params
        }
      }
    })

    const { data, error: saveError } = await saveWorkflow({
      title: title.trim(),
      description: description.trim(),
      agents: selectedSteps.filter(s => s.type === 'agent').map((s) => s.id),
      steps: stepsData,
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
    
    const stepsData = selectedSteps.map(step => {
      if (step.type === 'agent') {
        return { type: 'agent', id: step.id }
      } else {
        return { 
          type: 'mcp', 
          serverId: step.serverId, 
          toolId: step.toolId,
          credentials: step.credentials,
          params: step.params
        }
      }
    })

    navigate('/workflows/preview/run', {
      state: {
        workflow: {
          id: null,
          title: title.trim(),
          description: description.trim(),
          agents: selectedSteps.filter(s => s.type === 'agent').map((s) => s.id),
          steps: stepsData,
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
              Mix agents and MCP actions (up to {MAX_STEPS} steps)
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

      {/* Step Sequence Builder */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium dark:text-text-secondary text-gray-600">
            Workflow Steps <span className="text-red-400">*</span>
          </label>
          <span className="text-[11px] dark:text-text-muted text-gray-400">
            {selectedSteps.length}/{MAX_STEPS} steps
          </span>
        </div>

        {/* Chain Preview */}
        {selectedSteps.length > 0 && (
          <div className="mb-4 space-y-2">
            {selectedSteps.map((step, index) => {
              if (step.type === 'agent') {
                const IconComponent = Icons[step.icon] || Icons.Bot
                return (
                  <div key={`step-${index}`} className="animate-fade-in">
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg border
                        dark:bg-surface-card dark:border-border bg-white border-gray-200"
                    >
                      <div
                        className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center
                          text-[11px] font-bold text-accent flex-shrink-0"
                      >
                        {index + 1}
                      </div>
                      <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent size={15} className="text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium dark:text-text-primary text-gray-900 truncate">
                          {step.name}
                        </div>
                        <div className="text-[11px] dark:text-text-muted text-gray-400 truncate">
                          {step.category}
                        </div>
                      </div>
                      <button
                        onClick={() => removeStep(index)}
                        className="p-1 rounded-md transition-colors flex-shrink-0
                          dark:hover:bg-surface-hover dark:text-text-muted hover:text-red-400
                          hover:bg-red-50 text-gray-400"
                        aria-label="Remove step"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {index < selectedSteps.length - 1 && (
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
              } else {
                return (
                  <div key={`step-${index}`} className="animate-fade-in">
                    <MCPStepCard
                      step={step}
                      onUpdate={(config) => updateMCPStep(index, config)}
                      onRemove={() => removeStep(index)}
                      previousOutput={index > 0 ? `Output from previous step` : null}
                    />
                    {index < selectedSteps.length - 1 && (
                      <div className="flex justify-center my-2">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-px h-2 dark:bg-border bg-gray-200" />
                          <ArrowRight size={12} className="dark:text-text-muted text-gray-400 rotate-90" />
                          <div className="text-[9px] dark:text-text-muted text-gray-400 font-medium tracking-wide">
                            result feeds in
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              }
            })}
          </div>
        )}

        {/* Add Step Buttons */}
        {selectedSteps.length < MAX_STEPS && (
          <div className="space-y-2">
            <div className="relative">
              <button
                id="add-agent-btn"
                onClick={() => setDropdownOpen((o) => !o)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border
                  text-sm font-medium transition-all
                  dark:bg-surface-card dark:border-border dark:text-text-secondary dark:hover:border-accent/40
                  bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
              >
                <span className="flex items-center gap-2">
                  <Plus size={14} className="text-accent" />
                  Add {selectedSteps.length === 0 ? 'first' : 'next'} agent
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform dark:text-text-muted text-gray-400 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute top-full mt-1 left-0 right-0 z-30 rounded-lg border shadow-xl
                    dark:bg-surface-card dark:border-border bg-white border-gray-200
                    max-h-64 overflow-y-auto animate-fade-in"
                >
                  {availableAgents.length === 0 ? (
                    <div className="px-4 py-3 text-sm dark:text-text-muted text-gray-400 text-center">
                      All agents already added
                    </div>
                  ) : (
                    availableAgents.map((agent) => {
                      const IconComponent = Icons[agent.icon] || Icons.Bot
                      return (
                        <button
                          key={agent.id}
                          onClick={() => addAgent(agent)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                            dark:hover:bg-surface-hover hover:bg-gray-50"
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

            <button
              onClick={addMCPStep}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border
                text-sm font-medium transition-all
                dark:bg-surface-card dark:border-border dark:text-text-secondary dark:hover:border-accent/40
                bg-white border-gray-200 text-gray-600 hover:border-purple-300"
            >
              <span className="flex items-center gap-2">
                <Plus size={14} className="text-purple-600" />
                Add MCP Step (GitHub, Slack, etc.)
              </span>
            </button>
 main


            {dropdownOpen && (
              <div
                className="absolute top-full mt-1 left-0 right-0 z-30 rounded-lg border shadow-xl
                  dark:bg-surface-card dark:border-border bg-white border-gray-200
                  max-h-64 overflow-y-auto animate-fade-in"
              >
                {/* 🔍 STICKY SEARCH BAR INPUT */}
                <div className="p-2 sticky top-0 bg-white dark:bg-surface-card border-b dark:border-border z-10">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search agents by name or category..."
                    className="w-full px-2.5 py-1.5 rounded-md border text-xs transition-all
                      dark:bg-surface-input dark:border-border dark:text-text-primary dark:placeholder-text-muted
                      bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                      focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  />
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
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                          dark:hover:bg-surface-hover hover:bg-gray-50"
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
 main
          </div>
        )}

        {selectedSteps.length === 0 && (
          <p className="mt-2 text-[11px] dark:text-text-muted text-gray-400 flex items-center gap-1">
            <Bot size={11} />
            Add at least one step to build a workflow
          </p>
        )}
      </div>

      {/* Workflow Preview */}
      {selectedSteps.length > 0 && (
        <div
          className="mb-6 rounded-lg border p-4
            dark:bg-surface-card dark:border-border bg-white border-gray-200"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400 mb-3">
            Workflow Preview
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedSteps.map((step, index) => (
              <span key={`preview-${index}`} className="flex items-center gap-1.5">
                <span
                  className="text-xs font-medium px-2 py-1 rounded-md
                    dark:bg-surface-input dark:text-text-secondary dark:border-border
                    bg-gray-100 text-gray-700 border border-gray-200"
                >
                  {step.type === 'agent' ? step.name : `MCP: ${step.serverId || 'Configure'}`}
                </span>
                {index < selectedSteps.length - 1 && (
                  <ArrowRight size={12} className="dark:text-text-muted text-gray-400 flex-shrink-0" />
                )}
              </span>
            ))}
          </div>
          {selectedSteps.length > 1 && (
            <p className="mt-2 text-[11px] dark:text-text-muted text-gray-400">
              Output of each step becomes input for the next
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