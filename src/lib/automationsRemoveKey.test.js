import { describe, it, expect, beforeEach } from 'vitest'
import { removeAutomationKey, loadAutomations, saveAutomations, deleteRun, loadRuns, saveRuns } from './automationsService.js'

const VAULT_KEY = 'ila_encrypted_vault_v2'

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
    _store: () => store,
  }
})()

beforeEach(() => {
  globalThis.localStorage = localStorageMock
  localStorageMock.clear()
})

describe('removeAutomationKey', () => {
  it('removes a key from the vault', () => {
    // Seed a vault entry
    const vault = { 'auto-1': 'encrypted-secret', 'auto-2': 'another-secret' }
    localStorage.setItem(VAULT_KEY, JSON.stringify(vault))

    removeAutomationKey('auto-1')

    const updated = JSON.parse(localStorage.getItem(VAULT_KEY) || '{}')
    expect(updated['auto-1']).toBeUndefined()
    expect(updated['auto-2']).toBe('another-secret') // other keys preserved
  })

  it('does not throw when the key does not exist', () => {
    expect(() => removeAutomationKey('nonexistent-id')).not.toThrow()
  })

  it('does not throw when vault is empty', () => {
    expect(() => removeAutomationKey('any-id')).not.toThrow()
  })

  it('does not throw when storage is unavailable', () => {
    const origStorage = globalThis.localStorage
    globalThis.localStorage = {
      getItem: () => { throw new Error('SecurityError') },
      setItem: () => {},
      removeItem: () => {},
    }
    expect(() => removeAutomationKey('any-id')).not.toThrow()
    globalThis.localStorage = origStorage
  })
})

describe('deleteRun', () => {
  it('removes a run by id', () => {
    saveRuns([
      { id: 'run-1', automationId: 'auto-1' },
      { id: 'run-2', automationId: 'auto-1' },
    ])
    deleteRun('run-1')
    const remaining = loadRuns()
    expect(remaining.some(r => r.id === 'run-1')).toBe(false)
    expect(remaining.some(r => r.id === 'run-2')).toBe(true)
  })

  it('does not throw when run id does not exist', () => {
    saveRuns([{ id: 'run-1', automationId: 'auto-1' }])
    expect(() => deleteRun('nonexistent-run')).not.toThrow()
    expect(loadRuns().length).toBe(1) // existing run preserved
  })
})
