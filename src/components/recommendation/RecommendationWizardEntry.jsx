import { forwardRef } from 'react'
import { Sparkles } from 'lucide-react'

const RecommendationWizardEntry = forwardRef(function RecommendationWizardEntry({ onOpen, disabled = false, loading = false }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={(event) => {
        event.preventDefault()
        onOpen?.(event)
      }}
      disabled={disabled || loading}
      className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold border border-accent/30 text-accent bg-accent/10 hover:bg-accent/15 transition-all duration-200 shadow-md shadow-indigo-500/10 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="Open smart agent recommendation wizard"
    >
      <Sparkles size={16} aria-hidden="true" />
      {loading ? 'Loading agents…' : 'Find my agent'}
    </button>
  )
})

export default RecommendationWizardEntry
