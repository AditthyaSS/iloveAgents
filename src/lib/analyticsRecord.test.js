import { describe, it, expect, beforeEach } from 'vitest'
import { recordAnalyticsRun } from './useAnalytics.js'

const STORAGE_KEY = 'ila_analytics'

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
  // Stub window.dispatchEvent to avoid JSDOM errors
  globalThis.window = globalThis.window ?? {}
  if (!globalThis.window.dispatchEvent) {
    globalThis.window.dispatchEvent = () => {}
  }
})

describe('recordAnalyticsRun', () => {
  const baseRun = {
    agentId: 'agent-1',
    agentName: 'Code Reviewer',
    category: 'Engineering',
    provider: 'openai',
    model: 'gpt-4o',
    duration: 1200,
  }

  it('records an event in localStorage', () => {
    recordAnalyticsRun(baseRun)
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    const events = JSON.parse(raw)
    expect(events.length).toBe(1)
  })

  it('event has all expected fields', () => {
    recordAnalyticsRun(baseRun)
    const events = JSON.parse(localStorage.getItem(STORAGE_KEY))
    const event = events[0]
    expect(event.agentId).toBe('agent-1')
    expect(event.agentName).toBe('Code Reviewer')
    expect(event.category).toBe('Engineering')
    expect(event.provider).toBe('openai')
    expect(event.model).toBe('gpt-4o')
    expect(event.duration).toBe(1200)
    expect(typeof event.id).toBe('string')
    expect(typeof event.timestamp).toBe('number')
  })

  it('id includes agentId', () => {
    recordAnalyticsRun(baseRun)
    const events = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(events[0].id).toContain('agent-1')
  })

  it('defaults missing provider to "unknown"', () => {
    recordAnalyticsRun({ ...baseRun, provider: undefined })
    const events = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(events[0].provider).toBe('unknown')
  })

  it('defaults missing category to empty string', () => {
    recordAnalyticsRun({ ...baseRun, category: undefined })
    const events = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(events[0].category).toBe('')
  })

  it('duration is null when not provided', () => {
    recordAnalyticsRun({ ...baseRun, duration: undefined })
    const events = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(events[0].duration).toBeNull()
  })

  it('newer events appear first (newest-first ordering)', () => {
    recordAnalyticsRun({ ...baseRun, agentId: 'agent-first' })
    recordAnalyticsRun({ ...baseRun, agentId: 'agent-second' })
    const events = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(events[0].agentId).toBe('agent-second')
    expect(events[1].agentId).toBe('agent-first')
  })

  it('accumulates multiple events', () => {
    recordAnalyticsRun(baseRun)
    recordAnalyticsRun(baseRun)
    recordAnalyticsRun(baseRun)
    const events = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(events.length).toBe(3)
  })

  it('does not throw when localStorage is unavailable', () => {
    const origStorage = globalThis.localStorage
    // @ts-ignore
    globalThis.localStorage = { getItem: () => { throw new Error('no storage') }, setItem: () => {}, removeItem: () => {} }
    expect(() => recordAnalyticsRun(baseRun)).not.toThrow()
    globalThis.localStorage = origStorage
  })
})
