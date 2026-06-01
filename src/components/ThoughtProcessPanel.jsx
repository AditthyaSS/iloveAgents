import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronRight, Brain, CheckCircle2 } from 'lucide-react'

const BASE_STEPS = [
  { delay: 0,     text: 'Receiving request...' },
  { delay: 900,   text: 'Connecting to API...' },
  { delay: 2000,  text: 'Analyzing your input...' },
  { delay: 4500,  text: 'Processing context...' },
  { delay: 8500,  text: 'Structuring response...' },
  { delay: 13000, text: 'Formatting to Markdown...' },
]

const CATEGORY_STEP = {
  Engineering:  'Reviewing code structure...',
  Marketing:    'Crafting messaging framework...',
  Writing:      'Composing narrative flow...',
  HR:           'Evaluating professional context...',
  Finance:      'Calculating financial metrics...',
  Healthcare:   'Reviewing clinical context...',
  Design:       'Analyzing visual patterns...',
  Data:         'Processing data schema...',
  Security:     'Auditing for vulnerabilities...',
  Sales:        'Identifying value propositions...',
  Productivity: 'Optimizing task structure...',
  Legal:        'Reviewing legal framework...',
}

export default function ThoughtProcessPanel({ isActive, isDone, agentCategory }) {
  const [open, setOpen] = useState(true)
  const [visibleCount, setVisibleCount] = useState(0)
  const timersRef = useRef([])

  const steps = [...BASE_STEPS]
  if (agentCategory && CATEGORY_STEP[agentCategory]) {
    steps[3] = { delay: 4500, text: CATEGORY_STEP[agentCategory] }
  }

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    if (!isActive) {
      setVisibleCount(0)
      return
    }

    setVisibleCount(0)
    steps.forEach((step, i) => {
      const t = setTimeout(() => {
        setVisibleCount((prev) => Math.max(prev, i + 1))
      }, step.delay)
      timersRef.current.push(t)
    })

    return () => timersRef.current.forEach(clearTimeout)
  }, [isActive])

  // When done, snap all steps to visible
  useEffect(() => {
    if (isDone) setVisibleCount(steps.length)
  }, [isDone, steps.length])

  if (!isActive && !isDone) return null

  return (
    <div className="mb-4 rounded-lg border dark:bg-surface-card dark:border-border bg-white border-gray-200 animate-fade-in">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left group"
      >
        <div className="flex items-center gap-2">
          <Brain size={13} className="text-accent" />
          <span className="text-xs font-semibold dark:text-text-primary text-gray-700">
            Thought Process
          </span>
          {isDone && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
              Done
            </span>
          )}
          {isActive && !isDone && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-accent">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
              </span>
              Live
            </span>
          )}
        </div>
        {open
          ? <ChevronDown size={13} className="dark:text-text-muted text-gray-400" />
          : <ChevronRight size={13} className="dark:text-text-muted text-gray-400" />
        }
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-1.5">
          {steps.map((step, i) => {
            const visible = i < visibleCount
            const isCurrentlyActive = isActive && !isDone && i === visibleCount - 1

            if (!visible) return null

            return (
              <div key={step.text} className="flex items-center gap-2 animate-fade-in">
                {isCurrentlyActive ? (
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                  </span>
                ) : (
                  <CheckCircle2 size={12} className="text-success flex-shrink-0" />
                )}
                <span
                  className={`text-[11px] ${
                    isCurrentlyActive
                      ? 'dark:text-text-primary text-gray-800 font-medium'
                      : 'dark:text-text-muted text-gray-400'
                  }`}
                >
                  {step.text}
                </span>
              </div>
            )
          })}

          {isDone && (
            <div className="flex items-center gap-2 animate-fade-in pt-0.5 border-t dark:border-border border-gray-100 mt-1">
              <CheckCircle2 size={12} className="text-success flex-shrink-0" />
              <span className="text-[11px] font-semibold text-success">Complete ✓</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
