import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Clock, Play, Trash2, ToggleLeft, ToggleRight,
  ChevronRight, AlertCircle, CheckCircle2, Calendar, Zap,
  Loader2, Plus, ShieldCheck, Mail, Search, Filter,
  Activity, ArrowUpRight, Lock, Sparkles, RefreshCw
} from 'lucide-react'
import {
  loadAutomations, loadRuns, toggleAutomation, deleteAutomation,
  runAutomationNow, initAutomationEngine
} from '../lib/automationsService'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import CreateAutomationModal from '../components/CreateAutomationModal'

export default function AutomationsPage() {
  useDocumentTitle('Scheduled Automations')
  const navigate = useNavigate()

  const [automations, setAutomations] = useState([])
  const [runs, setRuns] = useState([])
  const [runningMap, setRunningMap] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | active | paused
  const [scheduleFilter, setScheduleFilter] = useState('all') // all | hourly | daily | weekly
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingAutomation, setEditingAutomation] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [notificationBanner, setNotificationBanner] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  )

  const reloadData = () => {
    setAutomations(loadAutomations())
    setRuns(loadRuns())
  }

  useEffect(() => {
    reloadData()
    initAutomationEngine()
    const interval = setInterval(reloadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleToggle = async (id) => {
    await toggleAutomation(id)
    reloadData()
  }

  const handleDelete = async (id) => {
    await deleteAutomation(id)
    setConfirmDeleteId(null)
    reloadData()
  }

  const handleRunNow = async (id) => {
    setRunningMap(prev => ({ ...prev, [id]: true }))
    try {
      await runAutomationNow(id)
    } catch (err) {
      alert(err.message || 'Run failed')
    } finally {
      setRunningMap(prev => ({ ...prev, [id]: false }))
      reloadData()
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission()
      setNotificationBanner(perm)
    }
  }

  // KPIs
  const totalCount = automations.length
  const activeCount = automations.filter(a => a.enabled).length
  const totalRunsCount = runs.length
  const successfulRuns = runs.filter(r => r.status === 'success').length
  const successRate = totalRunsCount > 0 ? Math.round((successfulRuns / totalRunsCount) * 100) : 100

  // Filtered list
  const filtered = automations.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus =
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? item.enabled :
      !item.enabled

    const matchesSchedule =
      scheduleFilter === 'all' ? true : item.schedule === scheduleFilter

    return matchesSearch && matchesStatus && matchesSchedule
  })

  const formatCountdown = (nextRunAt) => {
    if (!nextRunAt) return '—'
    const diff = nextRunAt - Date.now()
    if (diff <= 0) return 'Due now'
    const mins = Math.floor(diff / 60000)
    const hrs = Math.floor(mins / 60)
    const days = Math.floor(hrs / 24)
    if (days > 0) return `in ${days}d ${hrs % 24}h`
    if (hrs > 0) return `in ${hrs}h ${mins % 60}m`
    return `in ${mins}m`
  }

  const formatDate = (ts) => {
    if (!ts) return 'Never'
    return new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
              <Clock size={20} className="animate-spin-slow" />
            </div>
            <h1 className="text-2xl font-extrabold dark:text-text-primary text-gray-900 tracking-tight">
              Scheduled Automations
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-accent border border-accent/30">
              Autopilot
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-text-secondary">
            Set your favorite AI agents on autopilot with recurring schedules, execution history, and Resend email alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {notificationBanner === 'default' && (
            <button
              onClick={requestNotificationPermission}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 transition-all flex items-center gap-1.5"
            >
              <Zap size={14} />
              Enable Alerts
            </button>
          )}

          <button
            onClick={() => {
              setEditingAutomation(null)
              setIsCreateModalOpen(true)
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white
              bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500
              hover:opacity-95 shadow-lg shadow-indigo-500/25 active:scale-98 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            Schedule New Agent
          </button>
        </div>
      </div>

      {/* Security & Architecture Highlight Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border dark:border-indigo-500/20 border-indigo-200 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                Encrypted Key Storage (pgsodium) & Zero Plaintext Leakage
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-500">
                Active Protection
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Provider API keys are encrypted at rest with explicit opt-in consent. Standard interactive runs continue to remain browser-only.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg dark:bg-surface-card bg-white border dark:border-border border-gray-200">
            <Lock size={12} className="text-indigo-400" />
            <span>AES-GCM / pgsodium</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg dark:bg-surface-card bg-white border dark:border-border border-gray-200">
            <Mail size={12} className="text-pink-400" />
            <span>Resend Alerts</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border dark:border-border/80 border-gray-200 dark:bg-surface-card bg-white shadow-sm hover:border-accent/30 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Automations</span>
            <Calendar size={16} className="text-accent" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tabular-nums">
            {totalCount}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Configured agents</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border dark:border-border/80 border-gray-200 dark:bg-surface-card bg-white shadow-sm hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Autopilots</span>
            <Activity size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-500 tabular-nums">
            {activeCount}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Running on schedule</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border dark:border-border/80 border-gray-200 dark:bg-surface-card bg-white shadow-sm hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Recorded Runs</span>
            <Zap size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tabular-nums">
            {totalRunsCount}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Captured in run history</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border dark:border-border/80 border-gray-200 dark:bg-surface-card bg-white shadow-sm hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Success Rate</span>
            <CheckCircle2 size={16} className="text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-500 tabular-nums">
            {successRate}%
          </div>
          <p className="text-[11px] text-gray-400 mt-1">{successfulRuns} of {totalRunsCount} completed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 rounded-2xl border dark:border-border/80 border-gray-200 dark:bg-surface-card bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={15} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search automations or agents..."
            aria-label="Search automations or agents"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl text-xs dark:bg-surface-input dark:border-border bg-gray-50 border border-gray-200 outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="h-9 px-3 rounded-xl text-xs dark:bg-surface-input dark:border-border bg-gray-50 border border-gray-200 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="paused">Paused Only</option>
          </select>

          {/* Schedule Interval Filter */}
          <select
            value={scheduleFilter}
            onChange={e => setScheduleFilter(e.target.value)}
            aria-label="Filter by schedule"
            className="h-9 px-3 rounded-xl text-xs dark:bg-surface-input dark:border-border bg-gray-50 border border-gray-200 outline-none"
          >
            <option value="all">All Schedules</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>

          <button
            onClick={reloadData}
            aria-label="Refresh automation list"
            title="Refresh list"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-hover transition-colors"
          >
            <RefreshCw size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-20 rounded-2xl border dark:border-border border-gray-200 bg-white dark:bg-surface-card p-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 text-accent">
            <Clock size={28} />
          </div>
          <h3 className="text-base font-bold dark:text-white text-gray-900 mb-1">
            No automations found
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            {searchQuery || statusFilter !== 'all' || scheduleFilter !== 'all'
              ? 'Try adjusting your search query or filters to find what you are looking for.'
              : 'Put your favorite agents on recurring autopilot with automated runs and email reports.'}
          </p>
          <button
            onClick={() => {
              setEditingAutomation(null)
              setIsCreateModalOpen(true)
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-accent hover:bg-accent-hover shadow-md transition-all"
          >
            Schedule Your First Agent
          </button>
        </div>
      )}

      {/* Automations Cards Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(auto => {
            const isRunning = runningMap[auto.id]
            const autoRuns = runs.filter(r => r.automationId === auto.id)
            const lastRun = autoRuns[0]

            return (
              <div
                key={auto.id}
                className={`rounded-2xl border p-5 transition-all duration-200 relative group flex flex-col justify-between
                  dark:bg-surface-card dark:border-border/80 bg-white border-gray-200 shadow-sm hover:shadow-md
                  ${!auto.enabled ? 'opacity-75 bg-gray-50/50 dark:bg-surface/50' : ''}`}
              >
                <div>
                  {/* Top Bar: Status Toggle & Badges */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        auto.enabled ? 'bg-emerald-500/15 text-emerald-500' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                      }`}>
                        {auto.enabled ? 'Active' : 'Paused'}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                        {auto.schedule} ({auto.cron})
                      </span>
                      {auto.emailNotification && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-500 flex items-center gap-1">
                          <Mail size={10} /> Email
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggle(auto.id)}
                      className={`transition-colors ${auto.enabled ? 'text-accent' : 'text-gray-300 dark:text-gray-600'}`}
                      title={auto.enabled ? 'Pause Autopilot' : 'Resume Autopilot'}
                    >
                      {auto.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                  </div>

                  {/* Title & Agent Info */}
                  <Link
                    to={`/automations/${auto.id}`}
                    className="block group-hover:text-accent transition-colors"
                  >
                    <h3 className="text-base font-bold dark:text-text-primary text-gray-900 line-clamp-1">
                      {auto.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{auto.agentName}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">{auto.provider} ({auto.model})</span>
                  </div>

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl dark:bg-surface-hover/60 bg-gray-50 text-xs">
                    <div>
                      <span className="text-[10px] font-medium text-gray-400 block">Last Run</span>
                      <span className="font-medium dark:text-gray-200 text-gray-700">
                        {formatDate(auto.lastRunAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-medium text-gray-400 block">Next Autopilot Trigger</span>
                      <span className="font-medium text-accent">
                        {auto.enabled ? formatCountdown(auto.nextRunAt) : 'Paused'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Toolbar */}
                <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t dark:border-border/60 border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRunNow(auto.id)}
                      disabled={isRunning}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-accent/10 hover:bg-accent/20 text-accent transition-all flex items-center gap-1.5 disabled:opacity-50"
                      title="Execute Autopilot Run Now"
                    >
                      {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                      <span>{isRunning ? 'Running...' : 'Run Now'}</span>
                    </button>

                    <Link
                      to={`/automations/${auto.id}`}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold dark:hover:bg-surface-hover hover:bg-gray-100 text-gray-600 dark:text-gray-300 transition-all flex items-center gap-1"
                    >
                      <span>Logs ({autoRuns.length})</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingAutomation(auto)
                        setIsCreateModalOpen(true)
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-hover transition-colors text-xs font-medium"
                      title="Edit Automation"
                    >
                      Edit
                    </button>

                    {confirmDeleteId === auto.id ? (
                      <button
                        onClick={() => handleDelete(auto.id)}
                        className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        Confirm
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(auto.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Delete Automation"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal for Creating or Editing */}
      <CreateAutomationModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingAutomation(null)
        }}
        initialData={editingAutomation}
        onSuccess={reloadData}
      />
    </div>
  )
}
