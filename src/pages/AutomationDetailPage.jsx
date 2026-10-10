import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Clock, Play, Trash2, ToggleLeft, ToggleRight, ArrowLeft,
  CheckCircle2, AlertCircle, Zap, ShieldCheck, Mail, Edit3,
  Calendar, Layers, FileText, Download, Copy, Check, Loader2,
  RefreshCw, Send
} from 'lucide-react'
import {
  getAutomation, getRunsForAutomation, toggleAutomation,
  deleteAutomation, runAutomationNow, sendResendNotification,
  deleteRun, getEmailLogs
} from '../lib/automationsService'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import AutomationRunDrawer from '../components/AutomationRunDrawer'
import CreateAutomationModal from '../components/CreateAutomationModal'

export default function AutomationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [automation, setAutomation] = useState(null)
  const [runs, setRuns] = useState([])
  const [emailLogs, setEmailLogs] = useState([])
  const [activeTab, setActiveTab] = useState('history') // history | config | emails
  const [isRunning, setIsRunning] = useState(false)
  const [selectedRun, setSelectedRun] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [testEmailSending, setTestEmailSending] = useState(false)
  const [testEmailStatus, setTestEmailStatus] = useState('')

  useDocumentTitle(automation ? `${automation.name} - Automation` : 'Automation Details')

  const reloadData = () => {
    const item = getAutomation(id)
    if (!item) {
      // not found, could navigate back
      return
    }
    setAutomation(item)
    setRuns(getRunsForAutomation(id))
    setEmailLogs(getEmailLogs().filter(e => e.automationName === item.name || !e.automationName))
  }

  useEffect(() => {
    reloadData()
    const interval = setInterval(reloadData, 4000)
    return () => clearInterval(interval)
  }, [id])

  if (!automation) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center animate-fade-in">
        <h2 className="text-lg font-bold dark:text-white text-gray-900 mb-2">Automation Not Found</h2>
        <p className="text-xs text-gray-500 mb-6">The requested automation may have been deleted or does not exist.</p>
        <Link
          to="/automations"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-accent text-white hover:bg-accent-hover"
        >
          Return to Automations
        </Link>
      </div>
    )
  }

  const handleRunNow = async () => {
    setIsRunning(true)
    try {
      const finished = await runAutomationNow(automation.id)
      setSelectedRun(finished)
    } catch (err) {
      alert(err.message || 'Execution failed')
    } finally {
      setIsRunning(false)
      reloadData()
    }
  }

  const handleToggle = async () => {
    await toggleAutomation(automation.id)
    reloadData()
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this automation and all its run history?')) {
      await deleteAutomation(automation.id)
      navigate('/automations')
    }
  }

  const handleSendTestEmail = async () => {
    if (!automation.notificationEmail) {
      alert('Please configure a recipient email first by editing this automation.')
      return
    }
    setTestEmailSending(true)
    setTestEmailStatus('')
    try {
      await sendResendNotification({
        to: automation.notificationEmail,
        automationName: automation.name,
        agentName: automation.agentName,
        output: 'This is a test notification report from Open Agents Hub Scheduled Automations autopilot.',
        status: 'success',
        duration: 1200,
      })
      setTestEmailStatus('Test email dispatched successfully via Resend!')
      setTimeout(() => setTestEmailStatus(''), 4000)
      reloadData()
    } catch (e) {
      setTestEmailStatus('Failed to send test email.')
    } finally {
      setTestEmailSending(false)
    }
  }

  const handleDeleteRun = (runId, e) => {
    e.stopPropagation()
    deleteRun(runId)
    reloadData()
  }

  // Stats calculation
  const totalRuns = runs.length
  const successfulRuns = runs.filter(r => r.status === 'success').length
  const successRate = totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 100
  const avgDuration = totalRuns > 0
    ? (runs.reduce((acc, cur) => acc + (cur.duration || 0), 0) / totalRuns / 1000).toFixed(2)
    : '0.00'

  const formatDate = (ts) => {
    if (!ts) return '—'
    return new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/automations"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-accent transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to All Automations</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="p-6 rounded-2xl border dark:border-border/80 border-gray-200 dark:bg-surface-card bg-white shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-accent shrink-0 shadow-inner">
              <Clock size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                  {automation.name}
                </h1>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  automation.enabled ? 'bg-emerald-500/15 text-emerald-500' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                }`}>
                  {automation.enabled ? 'Active' : 'Paused'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                  {automation.schedule} ({automation.cron})
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                <Link to={`/agent/${automation.agentId}`} className="font-semibold text-accent hover:underline">
                  {automation.agentName}
                </Link>
                <span>•</span>
                <span className="font-mono text-[11px]">{automation.provider} ({automation.model})</span>
                <span>•</span>
                <span>Created {new Date(automation.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRunNow}
              disabled={isRunning}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white
                bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500
                hover:opacity-95 shadow-lg shadow-indigo-500/25 active:scale-98 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              <span>{isRunning ? 'Running Agent...' : 'Run Autopilot Now'}</span>
            </button>

            <button
              onClick={handleToggle}
              className="p-2 rounded-xl border dark:border-border border-gray-200 hover:bg-gray-50 dark:hover:bg-surface-hover text-gray-600 dark:text-gray-300 transition-colors"
              title={automation.enabled ? 'Pause Autopilot' : 'Resume Autopilot'}
            >
              {automation.enabled ? <ToggleRight size={20} className="text-accent" /> : <ToggleLeft size={20} />}
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border dark:border-border border-gray-200 hover:bg-gray-50 dark:hover:bg-surface-hover text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1"
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>

            <button
              onClick={handleDelete}
              className="p-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              title="Delete Automation"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t dark:border-border/60 border-gray-100">
          <div className="p-3 rounded-xl dark:bg-surface-hover/50 bg-gray-50">
            <span className="text-[10px] font-semibold uppercase text-gray-400">Total Runs</span>
            <p className="text-lg font-bold dark:text-white text-gray-900 tabular-nums">{totalRuns}</p>
          </div>
          <div className="p-3 rounded-xl dark:bg-surface-hover/50 bg-gray-50">
            <span className="text-[10px] font-semibold uppercase text-gray-400">Success Rate</span>
            <p className="text-lg font-bold text-emerald-500 tabular-nums">{successRate}%</p>
          </div>
          <div className="p-3 rounded-xl dark:bg-surface-hover/50 bg-gray-50">
            <span className="text-[10px] font-semibold uppercase text-gray-400">Avg Duration</span>
            <p className="text-lg font-bold dark:text-white text-gray-900 tabular-nums">{avgDuration}s</p>
          </div>
          <div className="p-3 rounded-xl dark:bg-surface-hover/50 bg-gray-50">
            <span className="text-[10px] font-semibold uppercase text-gray-400">pgsodium Vault</span>
            <p className="text-xs font-bold text-indigo-400 flex items-center gap-1 mt-1">
              <ShieldCheck size={14} /> Encrypted
            </p>
          </div>
        </div>
      </div>

      {testEmailStatus && (
        <div className="p-3 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-2">
          <CheckCircle2 size={15} />
          <span>{testEmailStatus}</span>
        </div>
      )}

      {/* Tabs Header */}
      <div role="tablist" aria-label="Automation details" className="flex items-center gap-2 border-b dark:border-border border-gray-200">
        <button
          role="tab"
          aria-selected={activeTab === 'history'}
          aria-controls="automation-tab-history"
          id="automation-tabbtn-history"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-accent text-accent'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <Clock size={14} />
          <span>Execution History ({runs.length})</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'config'}
          aria-controls="automation-tab-config"
          id="automation-tabbtn-config"
          onClick={() => setActiveTab('config')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'config'
              ? 'border-accent text-accent'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <FileText size={14} />
          <span>Agent Configuration</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'emails'}
          aria-controls="automation-tab-emails"
          id="automation-tabbtn-emails"
          onClick={() => setActiveTab('emails')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'emails'
              ? 'border-accent text-accent'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <Mail size={14} />
          <span>Email & Delivery Logs</span>
        </button>
      </div>

      {/* Tab 1: Execution History Table */}
      {activeTab === 'history' && (
        <div role="tabpanel" id="automation-tab-history" aria-labelledby="automation-tabbtn-history" className="space-y-4">
          {runs.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border dark:border-border border-gray-200 dark:bg-surface-card bg-white p-8">
              <Clock size={28} className="mx-auto mb-3 text-gray-400" />
              <h4 className="text-sm font-bold dark:text-white text-gray-900 mb-1">No recorded runs yet</h4>
              <p className="text-xs text-gray-500 mb-4">Trigger this automation manually or wait for the next scheduled cron tick.</p>
              <button
                onClick={handleRunNow}
                disabled={isRunning}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-accent hover:bg-accent-hover shadow-md"
              >
                Run Autopilot Now
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border dark:border-border/80 border-gray-200 dark:bg-surface-card bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <caption className="sr-only">Automation execution history</caption>
                  <thead className="border-b dark:border-border/60 border-gray-100 dark:bg-surface-hover/40 bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                    <tr>
                      <th scope="col" className="px-5 py-3">Status</th>
                      <th scope="col" className="px-5 py-3">Execution Time</th>
                      <th scope="col" className="px-5 py-3">Duration</th>
                      <th scope="col" className="px-5 py-3">Tokens</th>
                      <th scope="col" className="px-5 py-3">Email Report</th>
                      <th scope="col" className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-border/40 divide-gray-100">
                    {runs.map((run) => (
                      <tr
                        key={run.id}
                        onClick={() => setSelectedRun(run)}
                        className="hover:bg-gray-50 dark:hover:bg-surface-hover/50 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                            run.status === 'success' ? 'bg-emerald-500/15 text-emerald-500' :
                            run.status === 'running' ? 'bg-indigo-500/15 text-indigo-500' :
                            'bg-red-500/15 text-red-500'
                          }`}>
                            {run.status === 'success' && <CheckCircle2 size={11} />}
                            {run.status === 'running' && <Loader2 size={11} className="animate-spin" />}
                            {run.status === 'failed' && <AlertCircle size={11} />}
                            <span>{run.status}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-gray-700 dark:text-gray-300">
                          {formatDate(run.startedAt)}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-gray-600 dark:text-gray-400">
                          {(run.duration / 1000).toFixed(2)}s
                        </td>
                        <td className="px-5 py-3.5 font-mono text-gray-600 dark:text-gray-400">
                          {run.tokens || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">
                          {run.emailSent ? (
                            <span className="text-emerald-500 flex items-center gap-1 font-medium">
                              <Mail size={12} /> Sent
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedRun(run)
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                            >
                              Inspect Output
                            </button>
                            <button
                              onClick={(e) => handleDeleteRun(run.id, e)}
                              className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete Run"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Agent Configuration */}
      {activeTab === 'config' && (
        <div role="tabpanel" id="automation-tab-config" aria-labelledby="automation-tabbtn-config" className="space-y-4">
          <div className="p-6 rounded-2xl border dark:border-border/80 border-gray-200 dark:bg-surface-card bg-white space-y-6">
            <div>
              <h3 className="text-sm font-bold dark:text-white text-gray-900 uppercase tracking-wider mb-2">
                Configured Inputs Snapshot
              </h3>
              {automation.inputs && Object.keys(automation.inputs).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(automation.inputs).map(([k, v]) => (
                    <div key={k} className="p-3 rounded-xl dark:bg-surface-hover/50 bg-gray-50 border dark:border-border/40 border-gray-200">
                      <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">{k}</span>
                      <pre className="text-xs font-mono dark:text-gray-200 text-gray-800 whitespace-pre-wrap">
                        {Array.isArray(v) ? v.join(', ') : String(v)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No static inputs configured for this agent.</p>
              )}
            </div>

            {automation.systemPrompt && (
              <div className="pt-4 border-t dark:border-border/60 border-gray-100">
                <h3 className="text-sm font-bold dark:text-white text-gray-900 uppercase tracking-wider mb-2">
                  System Prompt
                </h3>
                <div className="p-3.5 rounded-xl dark:bg-[#0d1117] bg-gray-900 text-green-400 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                  {automation.systemPrompt}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Resend Email Activity */}
      {activeTab === 'emails' && (
        <div role="tabpanel" id="automation-tab-emails" aria-labelledby="automation-tabbtn-emails" className="space-y-4">
          <div className="p-6 rounded-2xl border dark:border-border/80 border-gray-200 dark:bg-surface-card bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold dark:text-white text-gray-900">
                  Resend Email Notification Settings
                </h3>
                <p className="text-xs text-gray-500">
                  Current Recipient: <strong>{automation.notificationEmail || 'Not configured'}</strong>
                </p>
              </div>

              <button
                onClick={handleSendTestEmail}
                disabled={testEmailSending || !automation.notificationEmail}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 border border-pink-500/30 transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                {testEmailSending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>Send Test Email</span>
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t dark:border-border/60 border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Recent Dispatched Emails</h4>
              {emailLogs.length === 0 ? (
                <p className="text-xs text-gray-400 py-4">No email delivery logs recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {emailLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl dark:bg-surface-hover/50 bg-gray-50 border dark:border-border/40 border-gray-200 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <p className="font-semibold dark:text-gray-200 text-gray-800">{log.subject}</p>
                        <p className="text-[11px] text-gray-400">To: {log.to} • {formatDate(log.sentAt)}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500">
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Run Inspection Drawer */}
      <AutomationRunDrawer
        run={selectedRun}
        isOpen={Boolean(selectedRun)}
        onClose={() => setSelectedRun(null)}
      />

      {/* Edit Automation Modal */}
      <CreateAutomationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={automation}
        onSuccess={reloadData}
      />
    </div>
  )
}
