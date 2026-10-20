import { describe, it, expect } from 'vitest'
import { loadAllAgents } from './registry'
import { CATEGORIES } from './categories'

describe('loadAllAgents', () => {
  it('should load all agent definitions', async () => {
    const agents = await loadAllAgents()
    expect(Array.isArray(agents)).toBe(true)
    expect(agents.length).toBeGreaterThan(0)
  })

  it('every agent should have required fields', async () => {
    const agents = await loadAllAgents()
    agents.forEach((agent) => {
      expect(agent).toHaveProperty('id')
      expect(agent).toHaveProperty('name')
      expect(agent).toHaveProperty('description')
      expect(agent).toHaveProperty('category')
      expect(agent).toHaveProperty('inputs')
      expect(typeof agent.id).toBe('string')
      expect(typeof agent.name).toBe('string')
      expect(Array.isArray(agent.inputs)).toBe(true)
    })
  })

  it('every agent id should be unique', async () => {
    const agents = await loadAllAgents()
    const ids = agents.map((a) => a.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('every agent id should be kebab-case', async () => {
    const agents = await loadAllAgents()
    const kebabRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/
    agents.forEach((agent) => {
      expect(agent.id).toMatch(kebabRegex)
    })
  })

  it('every agent should have a valid category', async () => {
    const agents = await loadAllAgents()
    agents.forEach((agent) => {
      expect(CATEGORIES).toContain(agent.category)
    })
  })

  it('should return the same cached result on subsequent calls', async () => {
    const first = await loadAllAgents()
    const second = await loadAllAgents()
    expect(first).toBe(second)
  })
})
