import { barWidthPercent } from './analyticsCharts'

function EmptyMini({ text }) {
  return <div className="text-xs text-gray-400 dark:text-text-muted py-4 text-center">{text}</div>
}

export default function TopAgentsChart({ agents, navigate }) {
  if (agents.length === 0) return <EmptyMini text="No agent data yet" />

  const maxCount = agents[0]?.count || 1

  return (
    <div className="space-y-2.5">
      {agents.map((agent, i) => {
        const pct = barWidthPercent(agent.count, maxCount)
        return (
          <div
            key={agent.agentId}
            className="group cursor-pointer"
            onClick={() => navigate(`/agent/${agent.agentId}`)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium dark:text-text-primary text-gray-700 truncate max-w-[200px]
                group-hover:text-accent transition-colors">
                {agent.agentName}
              </span>
              <span className="text-[11px] font-bold tabular-nums dark:text-text-muted text-gray-400">
                {agent.count}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-indigo-400 transition-all duration-700 ease-out
                  group-hover:from-accent group-hover:to-cyan-400"
                style={{
                  width: `${pct}%`,
                  animationDelay: `${i * 80}ms`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
