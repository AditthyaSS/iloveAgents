import { describe, it, expect, beforeEach } from 'vitest'
import {
  SCHEDULE_PRESETS,
  loadAutomations,
  saveAutomations,
  loadRuns,
  saveRuns,
  getEmailLogs,
  getAutomation,
  getRunsForAutomation,
  deleteRun,
} from './automationsService.js'

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

describe('SCHEDULE_PRESETS', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(SCHEDULE_PRESETS)).toBe(true)
    expect(SCHEDULE_PRESETS.length).toBeGreaterThan(0)
  })

  it('each preset has value, label, cron, ms, and description', () => {
    SCHEDULE_PRESETS.forEach(p => {
      expect(typeof p.value).toBe('string')
      expect(typeof p.label).toBe('string')
      expect(typeof p.cron).toBe('string')
      expect(typeof p.ms).toBe('number')
      expect(typeof p.description).toBe('string')
    })
  })

  it('ms values are positive', () => {
    SCHEDULE_PRESETS.forEach(p => expect(p.ms).toBeGreaterThan(0))
  })

  it('contains hourly, daily, and weekly presets', () => {
    const values = SCHEDULE_PRESETS.map(p => p.value)
    expect(values).toContain('hourly')
    expect(values).toContain('daily')
    expect(values).toContain('weekly')
  })

  it('daily ms is greater than hourly ms', () => {
    const hourly = SCHEDULE_PRESETS.find(p => p.value === 'hourly')
    const daily = SCHEDULE_PRESETS.find(p => p.value === 'daily')
    expect(daily.ms).toBeGreaterThan(hourly.ms)
  })
})

describe('loadAutomations / saveAutomations', () => {
  it('returns seed automations on first call (nothing stored)', () => {
    const automations = loadAutomations()
    expect(Array.isArray(automations)).toBe(true)
    expect(automations.length).toBeGreaterThan(0)
  })

  it('persists automations via saveAutomations and reloads them', () => {
    const custom = [{ id: 'auto-1', name: 'My Automation' }]
    saveAutomations(custom)
    const loaded = loadAutomations()
    expect(loaded).toEqual(custom)
  })

  it('returns seed automations when localStorage contains invalid JSON', () => {
    localStorageMock.setItem('ila_automations', 'not-json')
    const automations = loadAutomations()
    expect(Array.isArray(automations)).toBe(true)
    expect(automations.length).toBeGreaterThan(0)
  })
})

describe('loadRuns / saveRuns', () => {
  it('returns seed runs on first call', () => {
    const runs = loadRuns()
    expect(Array.isArray(runs)).toBe(true)
  })

  it('persists runs via saveRuns and reloads them', () => {
    const custom = [{ id: 'run-1', automationId: 'auto-1' }]
    saveRuns(custom)
    const loaded = loadRuns()
    expect(loaded).toEqual(custom)
  })

  it('returns seed runs when localStorage contains invalid JSON', () => {
    localStorageMock.setItem('ila_automation_runs', 'invalid')
    const runs = loadRuns()
    expect(Array.isArray(runs)).toBe(true)
  })
})

describe('getEmailLogs', () => {
  it('returns empty array when no logs stored', () => {
    expect(getEmailLogs()).toEqual([])
  })

  it('returns empty array when stored value is invalid JSON', () => {
    localStorageMock.setItem('ila_email_logs', 'broken')
    expect(getEmailLogs()).toEqual([])
  })
})

describe('getAutomation', () => {
  it('returns the automation with the matching id', () => {
    saveAutomations([
      { id: 'auto-1', name: 'Test' },
      { id: 'auto-2', name: 'Other' }
    ])
    const result = getAutomation('auto-1')
    expect(result?.id).toBe('auto-1')
    expect(result?.name).toBe('Test')
  })

  it('returns null for a non-existent id', () => {
    saveAutomations([{ id: 'auto-1', name: 'Test' }])
    expect(getAutomation('ghost')).toBeNull()
  })
})

describe('getRunsForAutomation', () => {
  it('returns only runs belonging to the given automationId', () => {
    saveRuns([
      { id: 'r1', automationId: 'auto-1' },
      { id: 'r2', automationId: 'auto-2' },
      { id: 'r3', automationId: 'auto-1' },
    ])
    const runs = getRunsForAutomation('auto-1')
    expect(runs.length).toBe(2)
    expect(runs.every(r => r.automationId === 'auto-1')).toBe(true)
  })

  it('returns empty array when automationId has no runs', () => {
    saveRuns([{ id: 'r1', automationId: 'auto-2' }])
    expect(getRunsForAutomation('auto-1')).toEqual([])
  })
})

describe('deleteRun', () => {
  it('removes the run with the given id', () => {
    saveRuns([
      { id: 'r1', automationId: 'auto-1' },
      { id: 'r2', automationId: 'auto-1' },
    ])
    deleteRun('r1')
    const remaining = loadRuns()
    expect(remaining.some(r => r.id === 'r1')).toBe(false)
    expect(remaining.some(r => r.id === 'r2')).toBe(true)
  })

  it('does not throw when the run does not exist', () => {
    saveRuns([{ id: 'r1', automationId: 'a' }])
    expect(() => deleteRun('ghost')).not.toThrow()
  })
})
