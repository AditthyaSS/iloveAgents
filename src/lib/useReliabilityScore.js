import { useMemo } from 'react'
import { useAgentRatings } from './useAgentRatings'
import { useAnalytics } from './useAnalytics'

// ── Trust level thresholds ───────────────────────────────────────────────
const TRUST_LEVELS = {
  HIGH: { label: 'High', min: 75 },
  MEDIUM: { label: 'Medium', min: 45 },
  LOW: { label: 'Low', min: 0 },
}

function getTrustLevel(score) {
  if (score >= TRUST_LEVELS.HIGH.min) return TRUST_LEVELS.HIGH.label
  if (score >= TRUST_LEVELS.MEDIUM.min) return TRUST_LEVELS.MEDIUM.label
  return TRUST_LEVELS.LOW.label
}

// Normalize a raw count against a soft cap using a simple diminishing curve,
// so a handful of runs isn't penalized as heavily as having zero.
function normalize(value, cap) {
  if (!value || value <= 0) return 0
  return Math.min(100, Math.round((Math.log1p(value) / Math.log1p(cap)) * 100))
}

function daysSince(timestamp) {
  if (!timestamp) return Infinity
  return (Date.now() - timestamp) / 86400000
}

/**
 * Computes a lightweight, heuristic 0-100 reliability score for a given
 * agent using locally available signals: user feedback (ratings), usage
 * frequency (run count), and recency of last use. No external calls,
 * no ML — fully client-side and instant.
 *
 * Weighting:
 *  - 50% user ratings (up/down feedback)
 *  - 30% usage/activity (how many times it's been run)
 *  - 20% recency (how recently it was last run)
 */
export function useReliabilityScore(agentId) {
  const { getAgentRatingInfo } = useAgentRatings()
  const { events } = useAnalytics('all')

  return useMemo(() => {
    if (!agentId) {
      return { score: 0, trustLevel: 'Low', ratingInfo: null, runCount: 0, lastRunAt: null }
    }

    const ratingInfo = getAgentRatingInfo(agentId)
    const agentEvents = events.filter((e) => e.agentId === agentId)
    const runCount = agentEvents.length
    const lastRunAt = agentEvents.length > 0
      ? Math.max(...agentEvents.map((e) => e.timestamp))
      : null

    // Ratings component: defaults to a neutral 50 when there's no feedback yet,
    // so a brand-new agent isn't unfairly scored as untrustworthy.
    const ratingScore = ratingInfo.total > 0 ? ratingInfo.percentage : 50

    // Activity component: diminishing returns after ~20 runs.
    const activityScore = normalize(runCount, 20)

    // Recency component: full marks if used within the last 7 days,
    // decaying to 0 by 90 days of inactivity.
    const idleDays = daysSince(lastRunAt)
    let recencyScore
    if (lastRunAt === null) {
      recencyScore = 30 // unused agents aren't penalized to zero, just below neutral
    } else if (idleDays <= 7) {
      recencyScore = 100
    } else if (idleDays >= 90) {
      recencyScore = 0
    } else {
      recencyScore = Math.round(100 - ((idleDays - 7) / (90 - 7)) * 100)
    }

    const score = Math.round(
      ratingScore * 0.5 + activityScore * 0.3 + recencyScore * 0.2
    )

    return {
      score: Math.max(0, Math.min(100, score)),
      trustLevel: getTrustLevel(score),
      ratingInfo,
      runCount,
      lastRunAt,
    }
  }, [agentId, events, getAgentRatingInfo])
}