import { describe, it, expect } from 'vitest'
import { getEnvKey, resolveProviderKey, KEY_ROTATION_STEPS } from './secretGuard'

describe('secretGuard', () => {
  it('prefers runtime key over env', () => {
    expect(resolveProviderKey('openai', ' sk-live ')).toBe('sk-live')
  })

  it('falls back to env when runtime is empty', () => {
    expect(typeof resolveProviderKey('openai', '')).toBe('string')
  })

  it('returns empty for unknown provider', () => {
    expect(getEnvKey('unknown')).toBe('')
  })

  it('exposes rotation steps', () => {
    expect(KEY_ROTATION_STEPS.length).toBeGreaterThan(2)
    expect(KEY_ROTATION_STEPS[0]).toMatch(/Revoke/i)
  })
})
