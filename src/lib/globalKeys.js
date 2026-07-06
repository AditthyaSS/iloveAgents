/**
 * globalKeys.js — manages persistent API key storage in localStorage.
 *
 * Keys are stored under these exact names:
 *   iloveagents_openai_key
 *   iloveagents_anthropic_key
 *   iloveagents_gemini_key
 *   iloveagents_default_provider
 */

const KEYS = {
  openai:          'iloveagents_openai_key',
  anthropic:       'iloveagents_anthropic_key',
  gemini:          'iloveagents_gemini_key',
  defaultProvider: 'iloveagents_default_provider',
}

/**
 * Read all globally saved keys from localStorage.
 * @returns {{ openai: string, anthropic: string, gemini: string, defaultProvider: string }}
 */
export function getGlobalKeys() {
  return {
    openai:          localStorage.getItem(KEYS.openai)          || '',
    anthropic:       localStorage.getItem(KEYS.anthropic)       || '',
    gemini:          localStorage.getItem(KEYS.gemini)          || '',
    defaultProvider: localStorage.getItem(KEYS.defaultProvider) || '',
  }
}

/**
 * Save keys to localStorage. Only saves non-empty values —
 * passing an empty string does NOT overwrite an existing saved key.
 * To explicitly clear a key use clearGlobalKey(provider).
 * @param {{ openai?: string, anthropic?: string, gemini?: string, defaultProvider?: string }} keys
 */
export function saveGlobalKeys({ openai, anthropic, gemini, defaultProvider } = {}) {
  if (openai          !== undefined && openai.trim()          !== '') localStorage.setItem(KEYS.openai,          openai.trim())
  if (anthropic       !== undefined && anthropic.trim()       !== '') localStorage.setItem(KEYS.anthropic,       anthropic.trim())
  if (gemini          !== undefined && gemini.trim()          !== '') localStorage.setItem(KEYS.gemini,          gemini.trim())
  if (defaultProvider !== undefined && defaultProvider.trim() !== '') localStorage.setItem(KEYS.defaultProvider, defaultProvider.trim())
}

/**
 * Remove a single provider's key from localStorage.
 * @param {'openai' | 'anthropic' | 'gemini'} provider
 */
export function clearGlobalKey(provider) {
  const storageKey = KEYS[provider]
  if (storageKey) localStorage.removeItem(storageKey)
}

/**
 * Remove all four localStorage entries managed by this module.
 */
export function clearAllGlobalKeys() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}

/**
 * Return an array of provider objects only for providers that have a saved key.
 * @returns {Array<{ id: string, label: string }>}
 */
export function getAvailableProviders() {
  const PROVIDER_LABELS = {
    openai:    'OpenAI',
    anthropic: 'Anthropic',
    gemini:    'Google Gemini',
  }

  const keys = getGlobalKeys()
  return Object.entries(PROVIDER_LABELS)
    .filter(([id]) => keys[id] && keys[id].trim() !== '')
    .map(([id, label]) => ({ id, label }))
}
