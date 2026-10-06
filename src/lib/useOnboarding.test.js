import { describe, it, expect, beforeEach } from 'vitest'
import { hasCompleted } from './useOnboarding.js'

const STORAGE_KEY = 'ila_onboarding_complete'

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
  }
})()

beforeEach(() => {
  globalThis.localStorage = localStorageMock
  localStorageMock.clear()
})

describe('hasCompleted', () => {
  it('returns false when no completion is stored', () => {
    expect(hasCompleted()).toBe(false)
  })

  it('returns true after completion is stored', () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    expect(hasCompleted()).toBe(true)
  })

  it('returns false when stored value is not "true"', () => {
    localStorage.setItem(STORAGE_KEY, '1')
    expect(hasCompleted()).toBe(false)

    localStorage.setItem(STORAGE_KEY, 'false')
    expect(hasCompleted()).toBe(false)
  })

  it('returns false when localStorage throws (storage unavailable)', () => {
    const origStorage = globalThis.localStorage
    globalThis.localStorage = {
      getItem: () => { throw new Error('SecurityError') },
      setItem: () => {},
      removeItem: () => {},
    }
    expect(hasCompleted()).toBe(false)
    globalThis.localStorage = origStorage
  })
})

describe('onboarding storage lifecycle (via localStorage)', () => {
  it('marks completion by writing "true" to the storage key', () => {
    // Simulate what endTour does
    localStorage.setItem(STORAGE_KEY, 'true')
    expect(hasCompleted()).toBe(true)
  })

  it('clears completion when the tour is reset', () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    expect(hasCompleted()).toBe(true)
    // Simulate what resetTour does
    localStorage.removeItem(STORAGE_KEY)
    expect(hasCompleted()).toBe(false)
  })

  it('state toggles correctly across multiple lifecycles', () => {
    // First visit — not completed
    expect(hasCompleted()).toBe(false)

    // Complete tour
    localStorage.setItem(STORAGE_KEY, 'true')
    expect(hasCompleted()).toBe(true)

    // Reset tour
    localStorage.removeItem(STORAGE_KEY)
    expect(hasCompleted()).toBe(false)

    // Complete again
    localStorage.setItem(STORAGE_KEY, 'true')
    expect(hasCompleted()).toBe(true)
  })
})
