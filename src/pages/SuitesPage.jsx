import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Code2, BarChart3, TrendingUp, DollarSign, Palette, PenLine, GraduationCap, Briefcase, HeartPulse, ShieldCheck, Gamepad2, Wand2, Loader2 } from 'lucide-react'
import { suites } from '../suites/suitesData'
import SuiteWizard from '../components/SuiteWizard'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { generateCustomSuite } from '../lib/customSuiteGenerator'
import { useApiKey } from '../lib/useApiKey'
import ApiKeyBar from '../components/ApiKeyBar'

// Map icon name string → Lucide component
const SUITE_ICONS = {
  Code2, BarChart3, TrendingUp, DollarSign, Palette,
  PenLine, GraduationCap, Briefcase, HeartPulse, ShieldCheck, Gamepad2,
}

/**
 * SuitesPage
 *
 * BROWSE state — shows all suite cards
 * QUIZ state   — shows SuiteWizard for the selected suite
 */
export default function SuitesPage() {
  useDocumentTitle('Suites')
  const navigate = useNavigate()
  const {
    provider,
    setProvider,
    apiKey,
    setApiKey,
    saveForSession,
    setSaveForSession,
  } = useApiKey()

  const [activeSuite, setActiveSuite] = useState(null)
  const [selectedModel, setSelectedModel] = useState(null)

  // Custom suite generator state
  const [goal, setGoal] = useState('')
  const [customSuite, setCustomSuite] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [generatorError, setGeneratorError] = useState(null)

  const handleGenerateSuite = async () => {
    if (!goal.trim() || !apiKey) return
    setGenerating(true)
    setCustomSuite(null)
    setGeneratorError(null)
    try {
      const result = await generateCustomSuite(goal, apiKey, provider)
      setCustomSuite(result)
    } catch (err) {
      setGeneratorError("Couldn't generate your suite. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  // ── QUIZ state
  if (activeSuite) {
    return (
      <div className="animate-fade-in">
        <SuiteWizard
          suite={activeSuite}
          onBack={() => setActiveSuite(null)}
        />
      </div>
    )
  }

  // ── BROWSE state
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-10 pt-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles size={22} className="text-accent" />
          <h1 className="text-3xl sm:text-4xl font-bold dark:text-text-primary text-gray-900 tracking-tight">
            Find Your Perfect Agents
          </h1>
        </div>
        <p className="text-sm dark:text-text-secondary text-gray-500 max-w-lg mx-auto leading-relaxed">
          Answer a few questions and we'll recommend the best agents for your needs —
          or browse by suite below.
        </p>
      </div>

      {/* Custom Suite Generator */}
      <div className="mb-10 rounded-xl border dark:bg-surface-card dark:border-border bg-white border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Wand2 size={16} className="text-accent" />
          <h2 className="text-sm font-bold dark:text-text-primary text-gray-900">
            Build Your Own Suite
          </h2>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
            Beta
          </span>
        </div>
        <p className="text-xs dark:text-text-secondary text-gray-500 mb-4">
          Don't see a suite for your goal? Describe it and we'll pick the best agents for you.
        </p>

        {/* API Key Bar */}
        <div className="mb-4">
          <ApiKeyBar
            provider={provider}
            setProvider={setProvider}
            apiKey={apiKey}
            setApiKey={setApiKey}
            saveForSession={saveForSession}
            setSaveForSession={setSaveForSession}
            agentProvider="any"
            model={selectedModel}
            setModel={setSelectedModel}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateSuite()}
            placeholder="e.g. I want to prepare for a Goldman Sachs interview..."
            className="flex-1 min-w-0 h-9 pl-3 pr-3 rounded-md text-sm transition-colors
              dark:bg-surface-input dark:border-border dark:text-text-primary dark:placeholder:text-text-muted
              bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400
              focus:ring-1 focus:ring-accent focus:border-accent outline-none"
          />
          <button
            onClick={handleGenerateSuite}
            disabled={!goal.trim() || !apiKey || generating}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-white
              bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200 active:scale-[0.98] shrink-0 w-full sm:w-auto"
          >
            {generating ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Wand2 size={13} />
            )}
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {generatorError && (
          <p className="text-[11px] text-red-500 mt-2">{generatorError}</p>
        )}

        {/* Custom Suite Result */}
        {customSuite && (
          <div className="mt-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={13} className="text-accent" />
              <h3 className="text-sm font-bold dark:text-text-primary text-gray-900">
                {customSuite.title}
              </h3>
            </div>
            <p className="text-xs dark:text-text-secondary text-gray-500 mb-3">
              {customSuite.description}
            </p>
            <div className="flex flex-col gap-2">
              {customSuite.agents.map((agent, index) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 p-3 rounded-lg border
                    dark:bg-surface-input dark:border-border bg-gray-50 border-gray-200"
                >
                  <span className="text-[11px] font-bold text-accent w-5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold dark:text-text-primary text-gray-900 truncate">
                      {agent.id}
                    </p>
                    <p className="text-[11px] dark:text-text-muted text-gray-400">
                      {agent.reason}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/agent/${agent.id}`)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:opacity-80 transition-opacity flex-shrink-0"
                  >
                    Open
                    <ArrowRight size={11} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setCustomSuite(null); setGoal('') }}
              className="mt-3 text-[11px] text-accent hover:underline"
            >
              ↺ Try a different goal
            </button>
          </div>
        )}
      </div>

      {/* Suite cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {suites.map((suite) => (
          <SuiteCard
            key={suite.id}
            suite={suite}
            onSelect={() => setActiveSuite(suite)}
          />
        ))}
      </div>

      {/* Footer note */}
      <div className="text-center">
        <button
          onClick={() => navigate('/')}
          className="text-xs dark:text-text-muted text-gray-400 hover:text-accent transition-colors"
        >
          Prefer to browse? View all agents →
        </button>
      </div>
    </div>
  )
}

// ── Suite card
function SuiteCard({ suite, onSelect }) {
  const IconComponent = SUITE_ICONS[suite.icon] || Code2
  return (
    <div
      className="premium-hover-card rounded-xl border p-5 flex flex-col gap-3 transition-all duration-300
        dark:bg-surface-card dark:border-border bg-white border-gray-200
        hover:shadow-md hover:-translate-y-1"
      style={{ borderTopColor: suite.color, borderTopWidth: 3 }}
    >
      {/* Icon + name */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: suite.color + '20' }}
        >
          <IconComponent size={17} style={{ color: suite.color }} />
        </div>
        <h2 className="text-base font-bold dark:text-text-primary text-gray-900 leading-tight">
          {suite.name}
        </h2>
      </div>

      {/* Description */}
      <p className="text-xs dark:text-text-secondary text-gray-500 leading-relaxed flex-1">
        {suite.description}
      </p>

      {/* Agent count badge + CTA */}
      <div className="flex items-center justify-between pt-1">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: suite.color + '20', color: suite.color }}
        >
          {suite.agents.length} agents
        </span>
        <button
          onClick={onSelect}
          className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
          style={{ color: suite.color }}
        >
          Find My Agents
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  )
}