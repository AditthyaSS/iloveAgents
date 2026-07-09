import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useRecommendationWizard } from '../../hooks/useRecommendationWizard'
import RecommendationWizardStep from './RecommendationWizardStep'
import RecommendationResults from './RecommendationResults'

const TOTAL_STEPS = 5

const focusWithoutScroll = (element) => {
  if (!element) return

  try {
    element.focus({ preventScroll: true })
  } catch {
    element.focus()
  }
}

export default function RecommendationWizardModal({ agents = [], isOpen, onClose, triggerRef }) {
  const wizard = useRecommendationWizard(agents)
  const panelRef = useRef(null)
  const headingRef = useRef(null)

  const handleClose = useCallback(() => {
    onClose?.()
    window.setTimeout(() => focusWithoutScroll(triggerRef?.current), 0)
  }, [onClose, triggerRef])

  useEffect(() => {
    if (isOpen) wizard.openWizard()
    else wizard.closeWizard()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('recommendation-wizard-open')
    window.setTimeout(() => focusWithoutScroll(headingRef.current), 0)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = [...panelRef.current.querySelectorAll('button:not([disabled]), a[href], textarea, input, select, [tabindex]:not([tabindex="-1"])')]
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey && (activeElement === first || !focusable.includes(activeElement))) {
        event.preventDefault()
        focusWithoutScroll(last)
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault()
        focusWithoutScroll(first)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.classList.remove('recommendation-wizard-open')
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClose, isOpen])

  if (!isOpen) return null

  const progress = wizard.hasCompleted ? 100 : ((wizard.currentStepIndex + 1) / TOTAL_STEPS) * 100
  const canGoBack = wizard.hasCompleted || wizard.currentStepIndex > 0
  const isLastStep = wizard.currentStepIndex === TOTAL_STEPS - 1

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 pointer-events-none sm:p-4" role="presentation">
      <div className="absolute inset-0 z-[101] bg-gray-950/60 backdrop-blur-sm pointer-events-auto" onClick={handleClose} aria-hidden="true" />
      <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="recommendation-wizard-title" aria-describedby="recommendation-wizard-description" className={`relative z-[102] flex max-h-[calc(100vh-2rem)] w-full ${wizard.hasCompleted ? 'max-w-3xl' : 'max-w-2xl'} flex-col overflow-hidden rounded-xl border border-white/40 bg-white shadow-2xl pointer-events-auto dark:border-border dark:bg-surface-card animate-fade-in`}>
        <header className="shrink-0 border-b border-gray-200 p-5 dark:border-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">Smart matching</p>
              <h1 id="recommendation-wizard-title" ref={headingRef} tabIndex={-1} className="mt-1 text-xl font-bold text-gray-900 outline-none dark:text-text-primary">{wizard.hasCompleted ? 'Recommended agents for you' : 'Find the right agent'}</h1>
              <p id="recommendation-wizard-description" className="mt-1 text-xs text-gray-500 dark:text-text-secondary">Answer a few questions for deterministic, rule-based recommendations.</p>
            </div>
            <button type="button" onClick={handleClose} aria-label="Close recommendation wizard" className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-text-muted dark:hover:bg-surface-input dark:hover:text-text-primary"><X size={18} /></button>
          </div>
          <div className="mt-4" aria-label={wizard.hasCompleted ? 'Results ready' : `Step ${wizard.currentStepIndex + 1} of ${TOTAL_STEPS}`}>
            <div className="mb-1 flex justify-between text-[11px] font-medium text-gray-500 dark:text-text-muted"><span>{wizard.hasCompleted ? 'Results' : `Step ${wizard.currentStepIndex + 1} of ${TOTAL_STEPS}`}</span><span>{Math.round(progress)}%</span></div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-surface-input"><div className="h-full rounded-full bg-accent transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progress}%` }} /></div>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {wizard.hasCompleted ? <RecommendationResults agents={agents} results={wizard.results} onRefine={wizard.refineAnswers} onStartOver={wizard.resetWizard} onClose={handleClose} /> : <RecommendationWizardStep stepIndex={wizard.currentStepIndex} preferences={wizard.preferences} errors={wizard.errors} setPreference={wizard.setPreference} toggleExtraPreference={wizard.toggleExtraPreference} />}
        </main>
        {!wizard.hasCompleted && (
          <footer className="shrink-0 border-t border-gray-200 bg-white p-4 dark:border-border dark:bg-surface-card">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={wizard.previousStep} disabled={!canGoBack} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-accent/40 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-surface-input dark:border-border dark:text-text-primary">Back</button>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                {wizard.currentStepIndex > 1 && <button type="button" onClick={isLastStep ? wizard.completeWizard : wizard.nextStep} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-500 transition-colors hover:text-accent dark:text-text-secondary">Skip</button>}
                <button type="button" onClick={isLastStep ? wizard.completeWizard : wizard.nextStep} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover">{isLastStep ? 'Show results' : 'Next'}</button>
              </div>
            </div>
          </footer>
        )}
      </section>
    </div>,
    document.body
  )
}
