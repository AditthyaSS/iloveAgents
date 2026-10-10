export const providerLabels = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Gemini',
  openrouter: 'OpenRouter',
  any: 'Any Provider',
}

export function formatProvider(provider) {
  return providerLabels[provider] || providerLabels.any
}

export const categoryMeta = {
  Productivity: { color: 'from-blue-500 to-cyan-400', ring: 'ring-blue-500/30' },
  Research: { color: 'from-violet-500 to-purple-400', ring: 'ring-violet-500/30' },
  Marketing: { color: 'from-pink-500 to-rose-400', ring: 'ring-pink-500/30' },
  Engineering: { color: 'from-emerald-500 to-green-400', ring: 'ring-emerald-500/30' },
  HR: { color: 'from-amber-500 to-yellow-400', ring: 'ring-amber-500/30' },
  Business: { color: 'from-orange-500 to-amber-400', ring: 'ring-orange-500/30' },
  Education: { color: 'from-indigo-500 to-blue-400', ring: 'ring-indigo-500/30' },
  Legal: { color: 'from-red-500 to-rose-400', ring: 'ring-red-500/30' },
  Design: { color: 'from-fuchsia-500 to-pink-400', ring: 'ring-fuchsia-500/30' },
  Product: { color: 'from-teal-500 to-cyan-400', ring: 'ring-teal-500/30' },
  'Developer Tools': { color: 'from-slate-600 to-slate-400', ring: 'ring-slate-500/30' },
}

export const defaultCategoryMeta = { color: 'from-gray-500 to-gray-400', ring: 'ring-gray-500/30' }

export function getCategoryMeta(category) {
  return categoryMeta[category] || defaultCategoryMeta
}
