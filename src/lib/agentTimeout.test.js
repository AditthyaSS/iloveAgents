import { describe, it, expect } from 'vitest'
import { getAgentTimeoutMs, timeoutMessage, DEFAULT_TIMEOUT_MS } from './agentTimeout'

describe('agentTimeout', () => {
  it('uses default when agent has no setting', () => {
    expect(getAgentTimeoutMs({})).toBe(DEFAULT_TIMEOUT_MS)
    expect(getAgentTimeoutMs(null)).toBe(DEFAULT_TIMEOUT_MS)
  })

  it('respects per-agent seconds', () => {
    expect(getAgentTimeoutMs({ timeoutSeconds: 60 })).toBe(60000)
    expect(getAgentTimeoutMs({ maxExecutionSeconds: 10 })).toBe(10000)
  })

  it('ignores invalid values', () => {
    expect(getAgentTimeoutMs({ timeoutSeconds: 0 })).toBe(DEFAULT_TIMEOUT_MS)
    expect(getAgentTimeoutMs({ timeoutSeconds: -5 })).toBe(DEFAULT_TIMEOUT_MS)
  })

  it('formats timeout message', () => {
    expect(timeoutMessage(300000)).toMatch(/300s/)
    expect(timeoutMessage(60000)).toMatch(/Partial output/i)
  })
})
