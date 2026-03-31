import { useMemo } from 'react'

export default function ScorecardOutput({ data }) {
  const parsed = useMemo(() => {
    if (typeof data === 'string') {
      try {
        // Try to extract JSON from the string (may have markdown code blocks around it)
        const cleaned = data.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        return JSON.parse(cleaned)
      } catch {
        return null
      }
    }
    return data
  }, [data])

  if (!parsed) {
    return (
      <div className="p-4 rounded-lg dark:bg-surface-card bg-white border dark:border-border border-gray-200">
        <p className="text-sm dark:text-text-secondary text-gray-600">
          Could not parse the response as a scorecard. Raw output:
        </p>
        <pre className="mt-2 text-xs dark:text-text-primary text-gray-900 whitespace-pre-wrap font-mono">
          {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
        </pre>
      </div>
    )
  }

  const score = parsed.matchScore ?? 0
  const scoreColor =
    score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'

  const recommendation = parsed.recommendation || 'N/A'
  const recColor = {
    'Strong Yes': 'bg-green-500/20 text-green-400 border-green-500/30',
    Yes: 'bg-green-500/10 text-green-400 border-green-500/20',
    Maybe: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    No: 'bg-red-500/10 text-red-400 border-red-500/20',
  }[recommendation] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'

  // SVG circle params
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="animate-fade-in space-y-4">
      {/* Top: Score + Recommendation */}
      <div className="flex flex-wrap items-center gap-6 p-5 rounded-lg dark:bg-surface-card bg-white border dark:border-border border-gray-200">
        {/* Circular Score */}
        <div className="score-circle">
          <svg width={130} height={130}>
            <circle
              cx={65}
              cy={65}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={6}
              className="dark:text-border text-gray-200"
            />
            <circle
              cx={65}
              cy={65}
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
          </svg>
          <span className="score-value" style={{ color: scoreColor }}>
            {score}
          </span>
        </div>

        <div className="flex-1 min-w-[200px]">
          <div className="text-xs uppercase tracking-wider dark:text-text-muted text-gray-400 mb-1">
            Match Score
          </div>
          <div className="text-2xl font-bold dark:text-text-primary text-gray-900 mb-3">
            {score}/100
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${recColor}`}>
            {recommendation}
          </div>
        </div>
      </div>

      {/* Criteria Breakdown */}
      {parsed.criteria && (
        <div className="p-4 rounded-lg dark:bg-surface-card bg-white border dark:border-border border-gray-200">
          <h3 className="text-sm font-semibold dark:text-text-primary text-gray-900 mb-3">
            Criteria Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(parsed.criteria).map(([name, val]) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium dark:text-text-secondary text-gray-600">
                    {name}
                  </span>
                  <span className="text-xs font-bold dark:text-text-primary text-gray-900">
                    {val.score}/100
                  </span>
                </div>
                <div className="w-full h-2 rounded-full dark:bg-surface-input bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${val.score}%`,
                      backgroundColor:
                        val.score >= 70
                          ? '#22c55e'
                          : val.score >= 40
                          ? '#f59e0b'
                          : '#ef4444',
                    }}
                  />
                </div>
                {val.comment && (
                  <p className="text-[11px] dark:text-text-muted text-gray-400 mt-0.5">
                    {val.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {parsed.strengths?.length > 0 && (
          <div className="p-4 rounded-lg dark:bg-surface-card bg-white border dark:border-border border-gray-200">
            <h3 className="text-sm font-semibold text-success mb-2">
              Top Strengths
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {parsed.strengths.map((s, i) => (
                <span
                  key={i}
                  className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium
                    bg-green-500/10 text-green-400 border border-green-500/20"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {parsed.gaps?.length > 0 && (
          <div className="p-4 rounded-lg dark:bg-surface-card bg-white border dark:border-border border-gray-200">
            <h3 className="text-sm font-semibold text-error mb-2">
              Top Gaps
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {parsed.gaps.map((g, i) => (
                <span
                  key={i}
                  className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium
                    bg-red-500/10 text-red-400 border border-red-500/20"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reasoning */}
      {parsed.reasoning && (
        <div className="p-4 rounded-lg dark:bg-surface-card bg-white border dark:border-border border-gray-200">
          <h3 className="text-sm font-semibold dark:text-text-primary text-gray-900 mb-2">
            Reasoning
          </h3>
          <p className="text-xs dark:text-text-secondary text-gray-600 leading-relaxed">
            {parsed.reasoning}
          </p>
        </div>
      )}
    </div>
  )
}
