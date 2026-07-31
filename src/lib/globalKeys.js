/**
 * globalKeys.js — manages saved API keys for the current browser session.
 *
 * API keys are secrets, so they live in sessionStorage (cleared when the tab
 * closes) wrapped with an 8-hour expiry — matching the policy already used in
 * useApiKey.js. They are NOT written to localStorage, which would persist them
 * indefinitely in plaintext and defeat that policy. The non-sensitive
 * default-provider preference stays in localStorage.
 *
 * Session key names:
 *   iloveagents_openai_key
 *   iloveagents_anthropic_key
 *   iloveagents_gemini_key
 *   iloveagents_openrouter_key
 * Preference name (localStorage):
 *   iloveagents_default_provider
 */

const KEYS = {
  openai:     'iloveagents_openai_key',
  anthropic:  'iloveagents_anthropic_key',
  gemini:     'iloveagents_gemini_key',
  openrouter: 'iloveagents_openrouter_key',
}
const DEFAULT_PROVIDER_KEY = 'iloveagents_default_provider'
const EXPIRY_MS = 8 * 60 * 60 * 1000 // 8 hours, matching useApiKey.js

/**
 * Read a secret from sessionStorage, honoring its expiry. Also removes any
 * legacy plaintext key an older version may have left in localStorage.
 */
function readSecret(storageKey) {
  // Clean up legacy localStorage leak from previous versions.
  if (localStorage.getItem(storageKey) !== null) localStorage.removeItem(storageKey)

  const raw = sessionStorage.getItem(storageKey)
  if (!raw) return ''
  try {
    const { key, expiresAt } = JSON.parse(raw)
    if (Date.now() > expiresAt) {
      sessionStorage.removeItem(storageKey)
      return ''
    }
    return key || ''
  } catch {
    return raw // tolerate a legacy plaintext session value
  }
}

/**
 * Store a secret in sessionStorage with a fresh 8-hour expiry.
 */
function writeSecret(storageKey, value) {
  sessionStorage.setItem(storageKey, JSON.stringify({
    key: value,
    expiresAt: Date.now() + EXPIRY_MS,
  }))
}

/**
 * Read all globally saved keys.
 * @returns {{ openai: string, anthropic: string, gemini: string, openrouter: string, defaultProvider: string }}
 */
export function getGlobalKeys() {
  return {
    openai:          readSecret(KEYS.openai),
    anthropic:       readSecret(KEYS.anthropic),
    gemini:          readSecret(KEYS.gemini),
    openrouter:      readSecret(KEYS.openrouter),
    defaultProvider: localStorage.getItem(DEFAULT_PROVIDER_KEY) || '',
  }
}

/**
 * Save keys. Only saves non-empty values — passing an empty string does NOT
 * overwrite an existing saved key. To explicitly clear a key use clearGlobalKey(provider).
 * @param {{ openai?: string, anthropic?: string, gemini?: string, openrouter?: string, defaultProvider?: string }} keys
 */
export function saveGlobalKeys({ openai, anthropic, gemini, openrouter, defaultProvider } = {}) {
  if (openai          !== undefined && openai.trim()          !== '') writeSecret(KEYS.openai,          openai.trim())
  if (anthropic       !== undefined && anthropic.trim()       !== '') writeSecret(KEYS.anthropic,       anthropic.trim())
  if (gemini          !== undefined && gemini.trim()          !== '') writeSecret(KEYS.gemini,          gemini.trim())
  if (openrouter      !== undefined && openrouter.trim()      !== '') writeSecret(KEYS.openrouter,      openrouter.trim())
  if (defaultProvider !== undefined && defaultProvider.trim() !== '') localStorage.setItem(DEFAULT_PROVIDER_KEY, defaultProvider.trim())
}

/**
 * Remove a single provider's saved key.
 * @param {'openai' | 'anthropic' | 'gemini' | 'openrouter'} provider
 */
export function clearGlobalKey(provider) {
  const storageKey = KEYS[provider]
  if (storageKey) {
    sessionStorage.removeItem(storageKey)
    localStorage.removeItem(storageKey) // clear any legacy leak too
  }
}

/**
 * Remove all key entries managed by this module (both current and legacy).
 */
export function clearAllGlobalKeys() {
  Object.values(KEYS).forEach((k) => {
    sessionStorage.removeItem(k)
    localStorage.removeItem(k)
  })
  localStorage.removeItem(DEFAULT_PROVIDER_KEY)
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
    openrouter: 'OpenRouter',
  }

  const keys = getGlobalKeys()
  return Object.entries(PROVIDER_LABELS)
    .filter(([id]) => keys[id] && keys[id].trim() !== '')
    .map(([id, label]) => ({ id, label }))
}
