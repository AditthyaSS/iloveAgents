// Helpers to keep provider keys out of version control.
//
// Runtime keys are entered in the browser and kept in sessionStorage
// (see useApiKey). These helpers only cover the optional local-dev
// fallback through Vite env vars, so a key never has to be pasted
// into a committed file.

const ENV_KEYS = {
  openai: 'VITE_OPENAI_API_KEY',
  anthropic: 'VITE_ANTHROPIC_API_KEY',
  gemini: 'VITE_GEMINI_API_KEY',
  openrouter: 'VITE_OPENROUTER_API_KEY',
}

export function getEnvKey(provider) {
  const name = ENV_KEYS[provider]
  if (!name) return ''
  try {
    const val = import.meta?.env?.[name]
    return typeof val === 'string' ? val.trim() : ''
  } catch {
    return ''
  }
}

export function resolveProviderKey(provider, runtimeKey) {
  if (runtimeKey && runtimeKey.trim()) return runtimeKey.trim()
  return getEnvKey(provider)
}

// Short rotation checklist used in docs and UI hints.
export const KEY_ROTATION_STEPS = [
  'Revoke the leaked key in the provider dashboard.',
  'Generate a new key and update your local .env file.',
  'Clear the old key from sessionStorage in the browser.',
  'Confirm .env is ignored by git before restarting.',
]
