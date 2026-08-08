import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, RotateCcw, Clock, Check } from 'lucide-react'
import * as Diff from 'diff'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function AgentEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [agent, setAgent] = useState(null)
  const [versions, setVersions] = useState([])
  const [activeVersion, setActiveVersion] = useState(null)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [configText, setConfigText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  
  useDocumentTitle('Agent Editor - ' + (agent?.name || 'Loading'))

  useEffect(() => {
    // Fetch agent details
    fetch(`http://localhost:8000/agents`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(a => a.id === id)
        if (found) setAgent(found)
      })
      .catch(err => console.error("Error fetching agents:", err))

    fetchVersions()
  }, [id])

  const fetchVersions = () => {
    fetch(`http://localhost:8000/agents/${id}/versions`)
      .then(res => res.json())
      .then(data => {
        setVersions(data)
        if (data.length > 0) {
          const current = data[0]
          setActiveVersion(current)
          setConfigText(JSON.stringify(current.config_snapshot, null, 2))
        } else {
          setConfigText('{\n  \n}')
        }
      })
      .catch(err => {
        console.error("Error fetching versions:", err)
        setError("Failed to fetch versions. Is the Python backend running on port 8000?")
      })
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const parsedConfig = JSON.parse(configText)
      
      const res = await fetch(`http://localhost:8000/agents/${id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: id,
          config_snapshot: parsedConfig,
          created_by: 'current_user@example.com',
          change_summary: 'Manual edit'
        })
      })
      
      if (!res.ok) throw new Error("Failed to save")
      
      await fetchVersions()
      setSelectedVersion(null)
    } catch (err) {
      setError("Invalid JSON or save failed: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRestore = async (versionId) => {
    try {
      setIsSaving(true)
      const res = await fetch(`http://localhost:8000/agents/${id}/rollback/${versionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: id,
          config_snapshot: {}, // Ignore, handled by backend
          created_by: 'current_user@example.com',
          change_summary: '' // Handled by backend
        })
      })
      
      if (!res.ok) throw new Error("Failed to restore")
      
      await fetchVersions()
      setSelectedVersion(null)
    } catch (err) {
      setError("Restore failed: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Generate Diff if a past version is selected
  const renderDiff = () => {
    if (!selectedVersion || !activeVersion) return null
    
    const diffResult = Diff.diffJson(selectedVersion.config_snapshot, activeVersion.config_snapshot)
    
    return (
      <div className="bg-gray-900 rounded-md p-4 overflow-x-auto text-sm font-mono text-gray-300">
        <h4 className="text-gray-400 mb-2 font-sans text-xs uppercase tracking-wider">
          Diff: v{selectedVersion.version_number} &rarr; v{activeVersion.version_number} (Current)
        </h4>
        {diffResult.map((part, index) => {
          const colorClass = part.added ? 'text-green-400 bg-green-400/10' : part.removed ? 'text-red-400 bg-red-400/10 line-through' : 'text-gray-300'
          return (
            <span key={index} className={colorClass}>
              {part.value}
            </span>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-surface-base">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b dark:border-border bg-white dark:bg-surface-card flex items-center px-6 justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-surface-hover text-gray-500 dark:text-text-secondary"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-text-primary">
                Agent Editor
              </h1>
              <p className="text-xs text-gray-500 dark:text-text-muted">
                {agent ? agent.name : 'Loading...'} (ID: {id})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {error && <span className="text-xs text-red-500">{error}</span>}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-hover disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Config'}
            </button>
          </div>
        </header>

        {/* Editor Area */}
        <main className="flex-1 overflow-auto p-6 flex flex-col">
          {selectedVersion ? (
            <div className="flex-1 flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium dark:text-text-primary text-gray-900">
                  Viewing Version {selectedVersion.version_number}
                </h3>
                <button
                  onClick={() => setSelectedVersion(null)}
                  className="text-xs text-accent hover:underline"
                >
                  Back to Current Edit
                </button>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">Snapshot v{selectedVersion.version_number}</h4>
                  <pre className="flex-1 bg-gray-100 dark:bg-surface-card rounded-md p-4 text-sm font-mono overflow-auto border dark:border-border text-gray-800 dark:text-gray-300">
                    {JSON.stringify(selectedVersion.config_snapshot, null, 2)}
                  </pre>
                  <button
                    onClick={() => handleRestore(selectedVersion.id)}
                    disabled={isSaving}
                    className="mt-4 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-border rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-surface-hover dark:text-text-primary"
                  >
                    <RotateCcw size={16} />
                    Restore this version
                  </button>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">Changes vs Current Active</h4>
                  <div className="flex-1 flex flex-col">
                    {renderDiff()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-2 animate-fade-in">
              <label className="text-sm font-medium dark:text-text-secondary text-gray-700">
                Active Configuration (JSON)
              </label>
              <textarea
                value={configText}
                onChange={(e) => {
                  setConfigText(e.target.value)
                  setError(null)
                }}
                className="flex-1 w-full p-4 rounded-lg border dark:border-border bg-white dark:bg-surface-input text-sm font-mono focus:ring-2 focus:ring-accent outline-none resize-none dark:text-gray-200"
                spellCheck={false}
              />
            </div>
          )}
        </main>
      </div>

      {/* Side Panel: Version History */}
      <div className="w-80 border-l dark:border-border bg-white dark:bg-surface-card flex flex-col h-full flex-shrink-0">
        <div className="p-4 border-b dark:border-border flex items-center gap-2">
          <Clock size={16} className="text-gray-500 dark:text-text-muted" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-text-primary">Version History</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {versions.map((v, i) => {
            const isActive = i === 0;
            const isSelected = selectedVersion?.id === v.id;
            
            return (
              <div 
                key={v.id} 
                onClick={() => setSelectedVersion(isActive ? null : v)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isActive 
                    ? 'border-accent bg-accent/5 dark:bg-accent/10' 
                    : isSelected 
                      ? 'border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-surface-hover' 
                      : 'border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isActive ? 'text-accent' : 'text-gray-700 dark:text-text-primary'}`}>
                      v{v.version_number}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                        <Check size={10} /> Active
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-text-muted">
                    {new Date(v.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">
                  {v.change_summary || "No summary provided"}
                </div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                  by {v.created_by}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
