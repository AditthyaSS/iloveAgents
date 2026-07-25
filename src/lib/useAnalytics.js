import { useState, useCallback, useEffect, useMemo } from 'react'

const STORAGE_KEY = 'ila_analytics'
const MAX_EVENTS = 500

// ── Persistence helpers ─────────────────────────────────────────────────────

function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch {}
}

// ── Seed from existing history (one-time) ───────────────────────────────────

function seedFromHistory() {
  const SEED_FLAG = 'ila_analytics_seeded'
  if (localStorage.getItem(SEED_FLAG)) return

  try {
    const historyRaw = localStorage.getItem('iloveAgents_history')
    if (!historyRaw) { localStorage.setItem(SEED_FLAG, '1'); return }

    const history = JSON.parse(historyRaw)
    if (!Array.isArray(history) || history.length === 0) {
      localStorage.setItem(SEED_FLAG, '1')
      return
    }

    const existing = loadEvents()
    const existingIds = new Set(existing.map((e) => e.id))

    const seeded = history
      .filter((run) => !existingIds.has(run.id))
      .map((run) => ({
        id: run.id,
        agentId: run.agentId,
        agentName: run.agentName,
        provider: run.provider || 'unknown',
        category: '',          // history doesn't store category
        model: '',
        duration: null,
        timestamp: run.timestamp || Date.now(),
      }))

    if (seeded.length > 0) {
      const merged = [...seeded, ...existing].slice(0, MAX_EVENTS)
      saveEvents(merged)
    }
  } catch {}

  localStorage.setItem(SEED_FLAG, '1')
}

// ── Plain function (for use outside React components) ───────────────────────

export function recordAnalyticsRun({ agentId, agentName, category, provider, model, duration }) {
  const event = {
    id: `${agentId}_${Date.now()}`,
    agentId,
    agentName,
    category: category || '',
    provider: provider || 'unknown',
    model: model || '',
    duration: duration ?? null,
    timestamp: Date.now(),
  }

  const prev = loadEvents()
  const next = [event, ...prev].slice(0, MAX_EVENTS)
  saveEvents(next)

  // Notify any mounted useAnalytics hooks
  window.dispatchEvent(new Event('ila_analytics_update'))
}

// ── Stats computation ───────────────────────────────────────────────────────

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function computeStats(events, timeRange = 'all') {
  // ── Time-range filtering
  const now = new Date()
  let filteredEvents = events

  if (timeRange !== 'all') {
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
    const days = daysMap[timeRange] || Infinity
    const cutoff = now.getTime() - days * 86400000
    filteredEvents = events.filter((e) => e.timestamp >= cutoff)
  }

  if (filteredEvents.length === 0) {
    return {
      totalRuns: 0,
      uniqueAgents: 0,
      favoriteProvider: null,
      currentStreak: 0,
      longestStreak: 0,
      avgRunsPerDay: 0,
      mostProductiveDay: null,
      topAgents: [],
      providerDistribution: [],
      categoryDistribution: [],
      dailyRuns: [],
      heatmapData: [],
      recentRuns: [],
    }
  }

  // ── Basic counts
  const totalRuns = filteredEvents.length
  const agentSet = new Set(filteredEvents.map((e) => e.agentId))
  const uniqueAgents = agentSet.size

  // ── Provider distribution
  const providerCounts = {}
  filteredEvents.forEach((e) => {
    const p = e.provider || 'unknown'
    providerCounts[p] = (providerCounts[p] || 0) + 1
  })
  const providerDistribution = Object.entries(providerCounts)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / totalRuns) * 100) }))
    .sort((a, b) => b.count - a.count)
  const favoriteProvider = providerDistribution[0]?.name || null

  // ── Top agents (top 8)
  const agentCounts = {}
  filteredEvents.forEach((e) => {
    if (!agentCounts[e.agentId]) {
      agentCounts[e.agentId] = { agentId: e.agentId, agentName: e.agentName, count: 0 }
    }
    agentCounts[e.agentId].count++
  })
  const topAgents = Object.values(agentCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // ── Category distribution
  const categoryCounts = {}
  filteredEvents.forEach((e) => {
    const cat = e.category || 'Uncategorized'
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
  })
  const categoryDistribution = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / totalRuns) * 100) }))
    .sort((a, b) => b.count - a.count)

  // ── Daily runs (last 30 days) for sparkline
  const dailyRuns = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = toDateKey(d)
    dailyRuns.push({ date: key, count: 0 })
  }
  const dailyMap = Object.fromEntries(dailyRuns.map((d) => [d.date, d]))
  filteredEvents.forEach((e) => {
    const key = toDateKey(new Date(e.timestamp))
    if (dailyMap[key]) dailyMap[key].count++
  })

  // ── Heatmap data (last 12 weeks = 84 days)
  const heatmapData = []
  for (let i = 83; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = toDateKey(d)
    heatmapData.push({ date: key, dayOfWeek: d.getDay(), count: 0 })
  }
  const heatmapMap = Object.fromEntries(heatmapData.map((d) => [d.date, d]))
  filteredEvents.forEach((e) => {
    const key = toDateKey(new Date(e.timestamp))
    if (heatmapMap[key]) heatmapMap[key].count++
  })

  // ── Streak calculations (current + longest)
  const allDayKeys = new Set(filteredEvents.map((e) => toDateKey(new Date(e.timestamp))))
  let currentStreak = 0
  const today = toDateKey(now)
  const yesterday = toDateKey(new Date(now.getTime() - 86400000))

  let startDate = allDayKeys.has(today) ? now : (allDayKeys.has(yesterday) ? new Date(now.getTime() - 86400000) : null)

  if (startDate) {
    let cursor = new Date(startDate)
    while (true) {
      const key = toDateKey(cursor)
      if (allDayKeys.has(key)) {
        currentStreak++
        cursor.setDate(cursor.getDate() - 1)
      } else {
        break
      }
    }
  }

  // Longest streak ever
  const sortedDays = [...allDayKeys].sort()
  let longestStreak = 0
  let tempStreak = 1
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1])
    const curr = new Date(sortedDays[i])
    const diffDays = Math.round((curr - prev) / 86400000)
    if (diffDays === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)
  if (sortedDays.length === 0) longestStreak = 0

  // ── Average runs per day (over days with at least 1 run)
  const activeDays = allDayKeys.size
  const avgRunsPerDay = activeDays > 0 ? +(totalRuns / activeDays).toFixed(1) : 0

  // ── Most productive day of the week
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]
  filteredEvents.forEach((e) => {
    const d = new Date(e.timestamp)
    dayOfWeekCounts[d.getDay()]++
  })
  const maxDayCount = Math.max(...dayOfWeekCounts)
  const mostProductiveDay = maxDayCount > 0 ? DAY_LABELS[dayOfWeekCounts.indexOf(maxDayCount)] : null

  // ── Recent runs (last 10)
  const recentRuns = filteredEvents.slice(0, 10).map((e) => ({
    id: e.id,
    agentName: e.agentName,
    provider: e.provider,
    category: e.category,
    model: e.model,
    duration: e.duration,
    timestamp: e.timestamp,
  }))

  return {
    totalRuns,
    uniqueAgents,
    favoriteProvider,
    currentStreak,
    longestStreak,
    avgRunsPerDay,
    mostProductiveDay,
    topAgents,
    providerDistribution,
    categoryDistribution,
    dailyRuns,
    heatmapData,
    recentRuns,
  }
}

function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── React hook ──────────────────────────────────────────────────────────────

export function useAnalytics(timeRange = 'all') {
  // Seed on first ever mount
  useEffect(() => { seedFromHistory() }, [])

  const [events, setEvents] = useState(loadEvents)

  // Listen to updates from recordAnalyticsRun (possibly same or other component)
  useEffect(() => {
    const sync = () => setEvents(loadEvents())
    const handleStorage = (e) => { if (e.key === STORAGE_KEY) sync() }
    window.addEventListener('ila_analytics_update', sync)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('ila_analytics_update', sync)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const stats = useMemo(() => computeStats(events, timeRange), [events, timeRange])

  const clearAnalytics = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setEvents([])
  }, [])

  return { events, stats, clearAnalytics }
}
