import { DEFAULT_RECOMMENDATION_WEIGHTS, GOAL_OPTIONS, EXTRA_PREFERENCE_OPTIONS, STOP_WORDS, RESULT_LIMIT, MIN_CONFIDENT_SCORE } from './constants.js'
import { TASK_KEYWORDS, CAPABILITY_KEYWORDS } from './rules.js'
import { buildRecommendationReasons } from './explanations.js'

const normalize = (value) => String(value || '').trim().toLowerCase()
const searchableText = (agent = {}) => normalize([agent.id, agent.name, agent.description, agent.category, agent.provider].filter(Boolean).join(' '))
const FREE_TEXT_TOKEN_LIMIT = 12

export function tokenizeFreeText(text = '') {
  return normalize(text)
    .split(/[^a-z0-9+#.-]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
    .slice(0, FREE_TEXT_TOKEN_LIMIT)
}

const getGoal = (id) => GOAL_OPTIONS.find((option) => option.id === id)
const getExtras = (ids = []) => EXTRA_PREFERENCE_OPTIONS.filter((option) => ids.includes(option.id))

function addSignal(list, value) {
  if (!value || list.includes(value)) return list
  return [...list, value]
}

export function normalizeScore(score, maxScore) {
  if (!Number.isFinite(score) || score <= 0 || !Number.isFinite(maxScore) || maxScore <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((score / maxScore) * 100)))
}

export function scoreAgent(agent = {}, preferences = {}, weights = DEFAULT_RECOMMENDATION_WEIGHTS) {
  const text = searchableText(agent)
  const category = agent?.category || ''
  const provider = normalize(agent?.provider || 'any')
  const goal = getGoal(preferences.primaryGoal)
  const categories = Array.isArray(preferences.categories) ? preferences.categories : []
  const extras = getExtras(preferences.extraPreferences)
  const taskTypes = [...new Set(goal?.taskTypes || [])]
  const matchedSignals = { taskTypes: [], capabilities: [], freeTextTerms: [] }
  let score = 0

  if (categories.includes(category)) {
    score += weights.exactCategory
    matchedSignals.exactCategory = true
  }

  if (goal?.categories?.includes(category)) {
    score += weights.goalCategory
    matchedSignals.goalCategory = true
  }

  taskTypes.forEach((taskType) => {
    const keywords = TASK_KEYWORDS[taskType] || [taskType]
    if (keywords.some((keyword) => text.includes(normalize(keyword)))) {
      score += weights.taskType
      matchedSignals.taskTypes = addSignal(matchedSignals.taskTypes, taskType)
    }
  })

  extras.forEach((extra) => {
    const keywords = CAPABILITY_KEYWORDS[extra.capability] || []
    if (keywords.some((keyword) => text.includes(normalize(keyword)))) {
      score += weights.capabilityKeyword ?? 0
      matchedSignals.capabilities = addSignal(matchedSignals.capabilities, extra.id)
    }
  })

  if (preferences.providerPreference && preferences.providerPreference !== 'any') {
    if (provider === preferences.providerPreference) {
      score += weights.providerExact
      matchedSignals.provider = 'exact'
    } else if (!provider || provider === 'any') {
      score += weights.providerAny
      matchedSignals.provider = 'compatible'
    }
  }

  tokenizeFreeText(preferences.freeTextGoal).forEach((term) => {
    if (normalize(agent.name).includes(term)) {
      score += weights.freeTextName
      matchedSignals.freeTextTerms = addSignal(matchedSignals.freeTextTerms, term)
    } else if (text.includes(term)) {
      score += weights.freeTextDescription
      matchedSignals.freeTextTerms = addSignal(matchedSignals.freeTextTerms, term)
    }
  })

  if (preferences.experienceLevel && preferences.experienceLevel !== 'any') {
    const beginnerTerms = ['explainer', 'guide', 'planner', 'study', 'quiz', 'checklist']
    const advancedTerms = ['code', 'sql', 'api', 'architecture', 'audit', 'solidity', 'kubernetes']
    const terms = preferences.experienceLevel === 'advanced' ? advancedTerms : beginnerTerms
    if (terms.some((term) => text.includes(term))) {
      score += weights.experience
      matchedSignals.experience = preferences.experienceLevel
    }
  }

  if (preferences.budgetPreference === 'fast' && ['summary', 'reply', 'regex', 'email', 'tone'].some((term) => text.includes(term))) {
    score += weights.urgency
    matchedSignals.preference = 'fast'
  }
  if (preferences.budgetPreference === 'capable' && ['audit', 'report', 'plan', 'architecture', 'analysis'].some((term) => text.includes(term))) {
    score += weights.urgency
    matchedSignals.preference = 'capable'
  }

  return { agentId: agent?.id, score, matchedSignals, reasons: buildRecommendationReasons(agent, preferences, matchedSignals) }
}

export function getMaxPossibleScore(preferences = {}, weights = DEFAULT_RECOMMENDATION_WEIGHTS) {
  const extras = Array.isArray(preferences.extraPreferences) ? preferences.extraPreferences.length : 0
  const taskCount = getGoal(preferences.primaryGoal)?.taskTypes?.length || 0
  const freeTextTokenCount = tokenizeFreeText(preferences.freeTextGoal).length
  return weights.exactCategory + weights.goalCategory + Math.max(1, taskCount) * weights.taskType + extras * (weights.capabilityKeyword ?? 0) + weights.providerExact + weights.freeTextName * freeTextTokenCount + weights.experience + weights.urgency
}

export function recommendAgents(agents = [], preferences = {}, options = {}) {
  const weights = options.weights || DEFAULT_RECOMMENDATION_WEIGHTS
  const limit = options.limit ?? RESULT_LIMIT
  if (!Array.isArray(agents) || !agents.length) return []
  const maxScore = Math.max(getMaxPossibleScore(preferences, weights), 1)
  return [...new Map(agents
    .filter((agent) => agent && agent.id)
    .map((agent) => [agent.id, agent])).values()]
    .map((agent) => ({ agent, ...scoreAgent(agent, preferences, weights) }))
    .map((result) => ({
      ...result,
      isConfident: result.score >= (options.minScore ?? MIN_CONFIDENT_SCORE),
      matchPercentage: normalizeScore(result.score, maxScore),
    }))
    .sort((a, b) => b.score - a.score || Number(Boolean(b.matchedSignals.exactCategory)) - Number(Boolean(a.matchedSignals.exactCategory)) || Number(Boolean(b.matchedSignals.provider)) - Number(Boolean(a.matchedSignals.provider)) || String(a.agent.name).localeCompare(String(b.agent.name)))
    .slice(0, limit)
    .map(({ agent, ...result }) => result)
}
