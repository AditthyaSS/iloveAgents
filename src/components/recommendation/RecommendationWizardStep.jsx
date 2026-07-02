import { Check } from 'lucide-react'
import { GOAL_OPTIONS, EXPERIENCE_OPTIONS, PROVIDER_OPTIONS, BUDGET_OPTIONS, EXTRA_PREFERENCE_OPTIONS } from '../../lib/agentRecommendation/constants.js'

function OptionButton({ option, selected, onClick }) {
  const Icon = option.icon
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={`min-h-11 rounded-xl border p-4 text-left transition-all duration-200 ${selected ? 'border-accent bg-accent/10 text-accent' : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 dark:bg-surface-card dark:border-border dark:text-text-secondary dark:hover:border-accent/40'}`}>
      <span className="flex items-start gap-3">
        {Icon && <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />}
        <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-gray-900 dark:text-text-primary">{option.label}</span>{option.description && <span className="mt-1 block text-xs leading-relaxed text-gray-500 dark:text-text-secondary">{option.description}</span>}</span>
        {selected && <span className="inline-flex items-center gap-1 text-[10px] font-semibold"><Check size={13} aria-hidden="true" />Selected</span>}
      </span>
    </button>
  )
}

export default function RecommendationWizardStep({ stepIndex, preferences, errors, setPreference, toggleExtraPreference }) {
  if (stepIndex === 0) return <StepShell step="Step 1 of 5" title="What do you want help with today?" error={errors.primaryGoal}><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{GOAL_OPTIONS.map((option) => <OptionButton key={option.id} option={option} selected={preferences.primaryGoal === option.id} onClick={() => setPreference('primaryGoal', option.id)} />)}</div></StepShell>
  if (stepIndex === 1) return <StepShell step="Step 2 of 5" title="How much guidance do you want?" error={errors.experienceLevel}><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{EXPERIENCE_OPTIONS.map((option) => <OptionButton key={option.id} option={option} selected={preferences.experienceLevel === option.id} onClick={() => setPreference('experienceLevel', option.id)} />)}</div></StepShell>
  if (stepIndex === 2) return <StepShell step="Step 3 of 5" title="Do you prefer a specific AI provider?" helper="This helps prioritize compatible agents. It won't exclude others."><div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">{PROVIDER_OPTIONS.map((option) => <OptionButton key={option.id} option={option} selected={preferences.providerPreference === option.id} onClick={() => setPreference('providerPreference', option.id)} />)}</div></StepShell>
  if (stepIndex === 3) return <StepShell step="Step 4 of 5" title="What's most important to you?" helper="This guides ranking only; it does not use pricing or cost data."><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{BUDGET_OPTIONS.map((option) => <OptionButton key={option.id} option={option} selected={preferences.budgetPreference === option.id} onClick={() => setPreference('budgetPreference', option.id)} />)}</div></StepShell>
  return <StepShell step="Step 5 of 5" title="Any extra preferences?" helper="Optional: choose any that apply and add a short goal."><div className="flex flex-wrap gap-2">{EXTRA_PREFERENCE_OPTIONS.map((option) => <button key={option.id} type="button" aria-pressed={preferences.extraPreferences.includes(option.id)} onClick={() => toggleExtraPreference(option.id)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${preferences.extraPreferences.includes(option.id) ? 'border-accent bg-accent/10 text-accent' : 'border-gray-200 bg-white text-gray-600 hover:border-accent/40 dark:bg-surface-card dark:border-border dark:text-text-secondary'}`}>{option.label}</button>)}</div><label className="block mt-4"><span className="text-xs font-semibold text-gray-700 dark:text-text-primary">Describe your goal (optional)</span><textarea value={preferences.freeTextGoal} maxLength={220} onChange={(e) => setPreference('freeTextGoal', e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:bg-surface-input dark:border-border dark:text-text-primary" placeholder="Example: I need to optimize a SQL query and explain indexes." /></label><p className="mt-1 text-[11px] text-gray-400 dark:text-text-muted">{preferences.freeTextGoal.length}/220 characters</p></StepShell>
}

function StepShell({ step, title, helper, error, children }) {
  return <div className="space-y-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-accent">{step}</p><h2 id="recommendation-wizard-step-title" className="mt-1 text-lg font-bold text-gray-900 dark:text-text-primary">{title}</h2>{helper && <p className="mt-1 text-xs text-gray-500 dark:text-text-secondary">{helper}</p>}{error && <p className="mt-2 text-xs font-medium text-red-500" role="alert">{error}</p>}</div>{children}</div>
}
