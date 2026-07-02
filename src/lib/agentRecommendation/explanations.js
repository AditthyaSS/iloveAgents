import { EXTRA_PREFERENCE_OPTIONS, GOAL_OPTIONS } from './constants.js'

const GOAL_REASONS = {
  'coding-development': 'Matches your coding and development workflow.',
  'research-analysis': 'Related to research, comparison, or summarization.',
  'writing-content': 'Matches your writing and content workflow.',
  automation: 'Related to workflow and task automation.',
  'data-analysis': 'Matches your data analysis workflow.',
  'image-generation': 'Related to image generation and visual work.',
  learning: 'Matches your learning and preparation goal.',
  'business-productivity': 'Related to business and productivity work.',
}

const TASK_REASONS = {
  code: 'Its metadata relates to coding tasks.',
  debug: 'Its stated focus includes debugging or troubleshooting.',
  review: 'Its stated focus includes review or quality checks.',
  technical: 'Its metadata relates to technical workflows.',
  research: 'Its metadata relates to research work.',
  summarize: 'Its stated focus includes summarization.',
  analyze: 'Its stated focus includes analysis.',
  write: 'Its stated focus includes writing.',
  rewrite: 'Its metadata relates to improving existing content.',
  generate: 'Its stated focus includes generating new output.',
  optimize: 'Its metadata relates to optimization.',
  automation: 'Its metadata relates to automated workflows.',
  plan: 'Its stated focus includes planning.',
  data: 'Its metadata relates to data tasks.',
  image: 'Its metadata relates to image or visual work.',
  creative: 'Its stated focus includes creative output.',
  explain: 'Its stated focus includes explanation.',
  quiz: 'Its metadata relates to quizzes or study.',
  practice: 'Its metadata relates to practice or preparation.',
  strategy: 'Its stated focus includes strategy.',
}

export function buildRecommendationReasons(agent, preferences = {}, matchedSignals = {}) {
  const reasons = []
  const goal = GOAL_OPTIONS.find((option) => option.id === preferences.primaryGoal)
  if (matchedSignals.exactCategory || matchedSignals.goalCategory || matchedSignals.taskTypes?.length) {
    reasons.push(GOAL_REASONS[preferences.primaryGoal] || 'Matches your selected workflow.')
  }
  if (matchedSignals.goalCategory && agent?.category) reasons.push(`Listed in ${agent.category}, a category related to this goal.`)
  matchedSignals.taskTypes?.forEach((taskType) => {
    if (TASK_REASONS[taskType]) reasons.push(TASK_REASONS[taskType])
  })
  matchedSignals.capabilities?.forEach((id) => {
    const preference = EXTRA_PREFERENCE_OPTIONS.find((option) => option.id === id)
    if (preference) reasons.push(`Its metadata suggests relevance to your ${preference.label.toLowerCase()} preference.`)
  })
  if (matchedSignals.provider === 'exact') reasons.push('Aligns with your preferred provider.')
  if (matchedSignals.provider === 'compatible') reasons.push('Uses flexible provider metadata compatible with your preference.')
  if (matchedSignals.freeTextTerms?.length) reasons.push(`Matched terms from your goal: ${matchedSignals.freeTextTerms.slice(0, 3).join(', ')}.`)
  if (matchedSignals.preference === 'fast') reasons.push('Its focused scope aligns with your fast, lightweight preference.')
  if (matchedSignals.preference === 'capable') reasons.push('Its detailed scope aligns with your capability preference.')
  if (matchedSignals.experience) reasons.push(`Its metadata aligns with your ${matchedSignals.experience} guidance preference.`)
  if (!reasons.length && goal && agent?.category) reasons.push(`Listed in ${agent.category}; this is one of the closest available matches.`)
  if (reasons.length < 3 && agent?.category && !reasons.some((reason) => reason.includes(`Listed in ${agent.category}`))) {
    reasons.push(`Agent metadata identifies its focus as ${agent.category}.`)
  }
  if (reasons.length < 3 && agent?.description) reasons.push('Its published description is relevant to the selected workflow.')
  return [...new Set(reasons)].slice(0, 4)
}
