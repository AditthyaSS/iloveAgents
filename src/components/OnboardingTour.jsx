// ============================================================
// I LOVE AGENTS — Onboarding Tour Component
// ============================================================
//
// A guided step-by-step tour that highlights key platform
// features using a spotlight overlay with tooltip cards.
//
// Features:
//   • Spotlight cutout around target elements
//   • Glassmorphic tooltip cards matching the app's UI
//   • Progress dots + step counter
//   • Keyboard navigation (Arrow keys, Escape)
//   • Auto-scroll to bring targets into view
//   • Responsive repositioning on resize
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
  Bot,
  Search,
  Swords,
  Workflow,
  Sun,
  Settings,
} from 'lucide-react'

const TOUR_STEPS = [
  {
    target: null, // Welcome step — no target, centered modal
    title: 'Welcome to iloveAgents! 🎉',
    description:
      "Let's take a quick tour to help you get the most out of the platform. It only takes 30 seconds!",
    icon: Compass,
    position: 'center',
  },
  {
    target: '[data-tour="sidebar-agents"]',
    title: 'Browse Agents',
    description:
      'Explore 100+ AI agents organized by category. Click any agent to open it and start using it right away.',
    icon: Bot,
    position: 'right',
  },
  {
    target: '#agent-search',
    title: 'Search & Filter',
    description:
      'Quickly find agents by name, description, or category. Pro tip: press "/" to focus the search bar instantly.',
    icon: Search,
    position: 'bottom',
  },
  {
    target: '#nav-battle-link',
    title: 'Battle Mode ⚔️',
    description:
      'Pit two agents against each other on the same prompt and vote for the best result. A fun way to compare!',
    icon: Swords,
    position: 'bottom',
  },
  {
    target: '#nav-workflows-link',
    title: 'Workflows',
    description:
      'Chain multiple agents together into automated pipelines. The output of one agent feeds into the next.',
    icon: Workflow,
    position: 'bottom',
  },
  {
    target: '#nav-theme-toggle',
    title: 'Theme Toggle',
    description:
      'Switch between dark and light mode for your preferred experience. Your choice is saved automatically.',
    icon: Sun,
    position: 'bottom',
  },
  {
    target: '#nav-settings-link',
    title: 'Settings & API Keys',
    description:
      'Save your API keys once in Settings and use all agents instantly. Supports OpenAI, Anthropic, and Gemini.',
    icon: Settings,
    position: 'bottom',
  },
]

const SPOTLIGHT_PADDING = 8
const TOOLTIP_GAP = 16

function getElementRect(selector) {
  if (!selector) return null
  const el = document.querySelector(selector)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    bottom: rect.bottom,
    right: rect.right,
    element: el,
  }
}

function getSpotlightClipPath(rect) {
  if (!rect) return 'none'

  const pad = SPOTLIGHT_PADDING
  const x = rect.left - pad
  const y = rect.top - pad
  const w = rect.width + pad * 2
  const h = rect.height + pad * 2
  const r = 12 // border-radius of the cutout

  // Create a polygon with a rectangular hole (using the evenodd fill rule on an SVG-based approach)
  // We use inset() with round for a cleaner spotlight
  return `inset(${y}px ${window.innerWidth - (x + w)}px ${window.innerHeight - (y + h)}px ${x}px round ${r}px)`
}

function getTooltipPosition(targetRect, position, tooltipRef) {
  const tooltip = tooltipRef?.current
  const tooltipWidth = tooltip?.offsetWidth || 360
  const tooltipHeight = tooltip?.offsetHeight || 200
  const gap = TOOLTIP_GAP
  const pad = SPOTLIGHT_PADDING

  if (!targetRect || position === 'center') {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }

  let top, left

  switch (position) {
    case 'right': {
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
      left = targetRect.right + pad + gap
      // If overflows right, put it on the left
      if (left + tooltipWidth > window.innerWidth - 20) {
        left = targetRect.left - pad - gap - tooltipWidth
      }
      break
    }
    case 'bottom': {
      top = targetRect.bottom + pad + gap
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
      // If overflows bottom, put it on top
      if (top + tooltipHeight > window.innerHeight - 20) {
        top = targetRect.top - pad - gap - tooltipHeight
      }
      break
    }
    case 'left': {
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
      left = targetRect.left - pad - gap - tooltipWidth
      if (left < 20) {
        left = targetRect.right + pad + gap
      }
      break
    }
    case 'top': {
      top = targetRect.top - pad - gap - tooltipHeight
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
      if (top < 20) {
        top = targetRect.bottom + pad + gap
      }
      break
    }
    default:
      top = targetRect.bottom + pad + gap
      left = targetRect.left
  }

  // Clamp to viewport
  top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20))
  left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20))

  return {
    top: `${top}px`,
    left: `${left}px`,
    transform: 'none',
  }
}

export default function OnboardingTour({
  isActive,
  onEnd,
  setSidebarOpen,
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState(null)
  const [tooltipStyle, setTooltipStyle] = useState({})
  const [isAnimating, setIsAnimating] = useState(false)
  const tooltipRef = useRef(null)
  const resizeTimerRef = useRef(null)

  const step = TOUR_STEPS[currentStep]

  // ── Measure target element & position tooltip ──
  const measureAndPosition = useCallback(() => {
    if (!isActive || !step) return

    if (step.target) {
      const rect = getElementRect(step.target)
      setTargetRect(rect)

      if (rect) {
        // Scroll element into view
        rect.element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        })

        // Position tooltip after a small delay for scroll
        requestAnimationFrame(() => {
          const updatedRect = getElementRect(step.target)
          setTargetRect(updatedRect)
          setTooltipStyle(
            getTooltipPosition(updatedRect, step.position, tooltipRef)
          )
        })
      }
    } else {
      setTargetRect(null)
      setTooltipStyle(getTooltipPosition(null, 'center', tooltipRef))
    }
  }, [isActive, step])

  // ── Open sidebar for step 1 (Browse Agents) ──
  useEffect(() => {
    if (!isActive) return

    if (currentStep === 1 && setSidebarOpen) {
      // On large screens the sidebar is always visible, on small screens we need to open it
      if (window.innerWidth < 1024) {
        setSidebarOpen(true)
      }
    }
  }, [currentStep, isActive, setSidebarOpen])

  // ── Re-measure on step change ──
  useEffect(() => {
    if (!isActive) return

    setIsAnimating(true)
    const timer = setTimeout(() => {
      measureAndPosition()
      setIsAnimating(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [currentStep, isActive, measureAndPosition])

  // ── Re-measure on resize ──
  useEffect(() => {
    if (!isActive) return

    const handleResize = () => {
      clearTimeout(resizeTimerRef.current)
      resizeTimerRef.current = setTimeout(measureAndPosition, 150)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimerRef.current)
    }
  }, [isActive, measureAndPosition])

  // ── Keyboard navigation ──
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          goNext()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          goPrev()
          break
        case 'Escape':
          e.preventDefault()
          handleSkip()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, currentStep])

  // ── Reset step when tour starts ──
  useEffect(() => {
    if (isActive) {
      setCurrentStep(0)
    }
  }, [isActive])

  const goNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      handleFinish()
    }
  }

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }

  const handleSkip = () => {
    if (setSidebarOpen && window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
    onEnd()
  }

  const handleFinish = () => {
    if (setSidebarOpen && window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
    onEnd()
  }

  if (!isActive) return null

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === TOUR_STEPS.length - 1
  const StepIcon = step.icon

  return (
    <div className="onboarding-overlay-wrapper" aria-modal="true" role="dialog" aria-label="Onboarding tour">
      {/* ── Dark overlay with spotlight cutout ── */}
      <div
        className="fixed inset-0 z-[200] transition-all duration-500 ease-out"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          clipPath: targetRect
            ? getSpotlightClipPath(targetRect)
            : 'none',
        }}
        onClick={handleSkip}
      />

      {/* ── Inverse overlay: blocks clicks outside spotlight ── */}
      {targetRect && (
        <div
          className="fixed inset-0 z-[199]"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
          onClick={handleSkip}
        />
      )}

      {/* ── Spotlight ring glow ── */}
      {targetRect && (
        <div
          className="fixed z-[201] pointer-events-none rounded-xl onboarding-spotlight-ring"
          style={{
            top: targetRect.top - SPOTLIGHT_PADDING,
            left: targetRect.left - SPOTLIGHT_PADDING,
            width: targetRect.width + SPOTLIGHT_PADDING * 2,
            height: targetRect.height + SPOTLIGHT_PADDING * 2,
          }}
        />
      )}

      {/* ── Center overlay for welcome step ── */}
      {!targetRect && !step.target && (
        <div
          className="fixed inset-0 z-[200]"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
          onClick={handleSkip}
        />
      )}

      {/* ── Tooltip Card ── */}
      <div
        ref={tooltipRef}
        className={`fixed z-[202] w-[340px] sm:w-[380px] onboarding-tooltip ${
          isAnimating ? 'onboarding-tooltip-entering' : 'onboarding-tooltip-visible'
        }`}
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative rounded-2xl border border-white/40 dark:border-white/10
            bg-white/90 dark:bg-[#101014]/90
            backdrop-blur-2xl
            shadow-[0_20px_60px_rgba(15,23,42,0.25),0_0_40px_rgba(99,102,241,0.15)]
            overflow-hidden"
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-cyan-400/30 via-indigo-400/30 to-rose-400/30 p-px pointer-events-none" />

          {/* Header */}
          <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <StepIcon size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold dark:text-text-primary text-gray-900 leading-tight">
                  {step.title}
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-widest dark:text-text-muted text-gray-400">
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>
              </div>
            </div>

            <button
              onClick={handleSkip}
              className="flex-shrink-0 p-1.5 rounded-lg dark:text-text-muted text-gray-400 hover:text-gray-900 dark:hover:text-text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Skip tour"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 pb-4">
            <p className="text-sm leading-relaxed dark:text-text-secondary text-gray-600">
              {step.description}
            </p>
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 flex items-center justify-between gap-3">
            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? 'w-6 bg-gradient-to-r from-indigo-500 to-violet-500'
                      : idx < currentStep
                        ? 'w-1.5 bg-indigo-400/50'
                        : 'w-1.5 bg-gray-300 dark:bg-white/15'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={goPrev}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold
                    dark:text-text-secondary text-gray-500
                    hover:bg-gray-100 dark:hover:bg-white/10
                    transition-all duration-200"
                >
                  <ChevronLeft size={14} />
                  Back
                </button>
              )}

              {isFirstStep && (
                <button
                  onClick={handleSkip}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold
                    dark:text-text-muted text-gray-400
                    hover:text-gray-600 dark:hover:text-text-secondary
                    transition-colors"
                >
                  Skip
                </button>
              )}

              <button
                onClick={goNext}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold text-white
                  bg-gradient-to-r from-indigo-500 to-violet-500
                  hover:from-indigo-400 hover:to-violet-400
                  shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40
                  transition-all duration-200 hover:-translate-y-0.5
                  active:scale-[0.97]"
              >
                {isLastStep ? (
                  "Let's Go! 🚀"
                ) : (
                  <>
                    Next
                    <ChevronRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
