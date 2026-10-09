import { describe, it, expect } from 'vitest'
import { loadAllAgents, reloadAgents } from '../agents/registry'

describe('registry reload', () => {
  it('reload fetches fresh while plain loads reuse the cache', async () => {
    const first = await loadAllAgents()
    const second = await loadAllAgents()
    expect(second).toBe(first)
    const third = await reloadAgents()
    expect(Array.isArray(third)).toBe(true)
    expect(third.length).toBe(first.length)
    expect(third).not.toBe(first)
  })
})
