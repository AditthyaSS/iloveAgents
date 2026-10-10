import { describe, it, expect } from 'vitest'
import { suites } from './suitesData.js'

describe('suites', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(suites)).toBe(true)
    expect(suites.length).toBeGreaterThan(0)
  })

  it('each suite has required fields: id, name, icon, description, color, agents', () => {
    suites.forEach((suite) => {
      expect(typeof suite.id, `${suite.id} id`).toBe('string')
      expect(typeof suite.name, `${suite.id} name`).toBe('string')
      expect(typeof suite.icon, `${suite.id} icon`).toBe('string')
      expect(typeof suite.description, `${suite.id} description`).toBe('string')
      expect(typeof suite.color, `${suite.id} color`).toBe('string')
      expect(Array.isArray(suite.agents), `${suite.id} agents`).toBe(true)
    })
  })

  it('all suite ids are unique', () => {
    const ids = suites.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each suite has at least one agent', () => {
    suites.forEach((suite) => {
      expect(suite.agents.length, `${suite.id} has agents`).toBeGreaterThan(0)
    })
  })

  it('all agent ids within each suite are strings', () => {
    suites.forEach((suite) => {
      suite.agents.forEach((agentId) => {
        expect(typeof agentId, `${suite.id}: agentId should be string`).toBe('string')
        expect(agentId.length, `${suite.id}: agentId non-empty`).toBeGreaterThan(0)
      })
    })
  })

  it('all suite colors are valid hex codes', () => {
    suites.forEach((suite) => {
      expect(suite.color, `${suite.id} color format`).toMatch(/^#[0-9a-fA-F]{3,8}$/)
    })
  })

  it('suite names are non-empty strings without leading/trailing whitespace', () => {
    suites.forEach((suite) => {
      expect(suite.name.trim()).toBe(suite.name)
      expect(suite.name.length).toBeGreaterThan(0)
    })
  })

  it('no duplicate agent ids within a single suite', () => {
    suites.forEach((suite) => {
      const ids = suite.agents
      const unique = new Set(ids)
      expect(unique.size, `${suite.id} has duplicate agents`).toBe(ids.length)
    })
  })
})
