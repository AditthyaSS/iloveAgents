import { useReliabilityScore } from "../lib/useReliabilityScore";

const trustColors = {
  High: {
    dot: "bg-green-400",
    text: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  Medium: {
    dot: "bg-amber-400",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  Low: {
    dot: "bg-gray-400",
    text: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
  },
};

/**
 * Compact badge: "● High Trust · 88/100"
 * Use `variant="full"` for a larger card-style breakdown (agent detail page).
 */
export default function ReliabilityBadge({ agentId, variant = "compact" }) {
  const { score, trustLevel, ratingInfo, runCount } = useReliabilityScore(agentId);
  const colors = trustColors[trustLevel] || trustColors.Low;

  if (variant === "full") {
    return (
      <div
        className={`rounded-lg border p-4 dark:bg-surface-card dark:border-border bg-white border-gray-200`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">
            Reliability Score
          </span>
          <span className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {trustLevel} Trust
          </span>
        </div>

        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-2xl font-bold dark:text-text-primary text-gray-900">
            {score}
          </span>
          <span className="text-xs dark:text-text-muted text-gray-400">/ 100</span>
        </div>

        <div className="w-full h-1.5 rounded-full dark:bg-surface-input bg-gray-100 overflow-hidden mb-3">
          <div
            className={`h-full ${colors.dot} transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] dark:text-text-secondary text-gray-500">
          <div>
            👍 {ratingInfo?.up ?? 0} · 👎 {ratingInfo?.down ?? 0}
          </div>
          <div className="text-right">
            {runCount} run{runCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
      title={`Reliability score: ${score}/100 (${runCount} runs, ${ratingInfo?.up ?? 0} up / ${ratingInfo?.down ?? 0} down)`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {trustLevel} Trust · {score}/100
    </span>
  );
}