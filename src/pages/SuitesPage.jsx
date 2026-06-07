import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
import { suites } from '../suites/suitesData'
import SuiteWizard from '../components/SuiteWizard'
import { useDocumentTitle } from '../lib/useDocumentTitle'

/**
 * SuitesPage
 *
 * BROWSE state — shows all suite cards
 * QUIZ state   — shows SuiteWizard for the selected suite
 */
export default function SuitesPage() {
  useDocumentTitle('Suites')
  const navigate = useNavigate()
  const [activeSuite, setActiveSuite] = useState(null) // suite object | null

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
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-3 transition-all duration-200
        dark:bg-surface-card dark:border-border bg-white border-gray-200
        hover:shadow-md hover:-translate-y-0.5"
      style={{ borderTopColor: suite.color, borderTopWidth: 3 }}
    >
      {/* Emoji + name */}
      <div className="flex items-center gap-2">
        <span className="text-2xl" role="img" aria-label={suite.name}>
          {suite.emoji}
        </span>
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
