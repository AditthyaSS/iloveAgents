import { describe, it, expect } from 'vitest'
import { createTrace } from './executionTrace'

describe('createTrace — runId format and uniqueness properties', () => {
  it('runId starts with run_', () => {
    expect(createTrace().runId.startsWith('run_')).toBe(true)
  })

  it('runId contains a timestamp component', () => {
    const before = Date.now()
    const trace = createTrace()
    const after = Date.now()
    const parts = trace.runId.split('_')
    const timestamp = parseInt(parts[1])
    expect(timestamp).toBeGreaterThanOrEqual(before)
    expect(timestamp).toBeLessThanOrEqual(after)
  })

  it('runId contains a random suffix', () => {
    const parts = createTrace().runId.split('_')
    // Format: run_<timestamp>_<random>
    expect(parts.length).toBeGreaterThanOrEqual(3)
    expect(parts[2]).toBeTruthy()
    expect(parts[2].length).toBeGreaterThan(0)
  })

  it('random suffix is alphanumeric', () => {
    const parts = createTrace().runId.split('_')
    expect(parts[2]).toMatch(/^[a-z0-9]+$/)
  })

  it('generates 5 unique runIds in quick succession', () => {
    const ids = new Set(Array.from({ length: 5 }, () => createTrace().runId))
    expect(ids.size).toBe(5)
  })

  it('runId does not contain spaces or special characters', () => {
    const id = createTrace().runId
    expect(id).toMatch(/^[a-z0-9_]+$/)
  })

  it('10 consecutive traces have unique timestamps or random suffixes', () => {
    const ids = Array.from({ length: 10 }, () => createTrace().runId)
    const unique = new Set(ids)
    expect(unique.size).toBe(10)
  })
})
