import { describe, it, expect } from 'vitest'
import { createTrace, finalizeTrace } from './executionTrace'

describe('executionTrace — ISO date string format', () => {
  it('startedAt is a valid ISO 8601 string', () => {
    const trace = createTrace()
    const date = new Date(trace.startedAt)
    expect(date.toString()).not.toBe('Invalid Date')
    expect(trace.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('startedAt ends with Z (UTC)', () => {
    const trace = createTrace()
    expect(trace.startedAt.endsWith('Z')).toBe(true)
  })

  it('endedAt is null before finalize', () => {
    expect(createTrace().endedAt).toBeNull()
  })

  it('endedAt is ISO string after finalize', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done' })
    const date = new Date(trace.endedAt)
    expect(date.toString()).not.toBe('Invalid Date')
  })

  it('endedAt >= startedAt', () => {
    const trace = createTrace()
    finalizeTrace(trace, { status: 'done' })
    expect(new Date(trace.endedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(trace.startedAt).getTime()
    )
  })

  it('multiple traces have startedAt close to each other', () => {
    const t1 = createTrace()
    const t2 = createTrace()
    const diff = Math.abs(
      new Date(t2.startedAt).getTime() - new Date(t1.startedAt).getTime()
    )
    expect(diff).toBeLessThan(1000) // within 1 second
  })
})
