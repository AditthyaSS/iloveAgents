import { donutSegments } from './analyticsCharts'

function EmptyMini({ text }) {
  return <div className="text-xs text-gray-400 dark:text-text-muted py-4 text-center">{text}</div>
}

export const PROVIDER_COLORS = {
  openai:     { color: '#22c55e', label: 'OpenAI' },
  anthropic:  { color: '#f97316', label: 'Anthropic' },
  gemini:     { color: '#3b82f6', label: 'Gemini' },
  openrouter: { color: '#06b6d4', label: 'OpenRouter' },
  unknown:    { color: '#71717a', label: 'Unknown' },
}

export default function ProviderDonut({ data, total }) {
  if (data.length === 0) return <EmptyMini text="No provider data" />

  const size = 140
  const strokeWidth = 22
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const segments = donutSegments(data, total, PROVIDER_COLORS).map((seg) => ({
    ...seg,
    dash: (seg.count / (total || 1)) * circumference,
    dashOffset: -seg.offset * circumference,
  }))

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-100 dark:text-white/5"
          />
          {segments.map((seg, i) => (
            <circle
              key={seg.name}
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold dark:text-text-primary text-gray-900 tabular-nums">{total}</span>
          <span className="text-[9px] dark:text-text-muted text-gray-400 font-medium">RUNS</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[10px] font-medium dark:text-text-secondary text-gray-500">
              {seg.label} ({seg.pct}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
