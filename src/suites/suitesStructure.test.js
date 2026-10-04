import { describe, it, expect } from 'vitest'
import { loadAllAgents } from '../agents/registry'
import { suites } from './suitesData'

describe('suitesData structure', () => {
  it('has unique suite ids with names and icons', () => {
    const ids = suites.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const suite of suites) {
      expect(suite.name, suite.id).toBeTruthy()
      expect(suite.icon, suite.id).toBeTruthy()
    }
  })

  it('lists non empty agents resolving to the registry', async () => {
    const agents = await loadAllAgents()
    const ids = new Set(agents.map((a) => a.id))
    for (const suite of suites) {
      expect(suite.agents.length, suite.id).toBeGreaterThan(0)
      for (const agentId of suite.agents) {
        expect(ids.has(agentId), `${suite.id} -> ${agentId}`).toBe(true)
      }
    }
  })

  it('keeps quiz questions well formed', () => {
    for (const suite of suites) {
      for (const question of suite.quiz?.questions ?? []) {
        expect(question.options.length, `${suite.id} options`).toBeGreaterThan(0)
        for (const option of question.options) {
          expect(option.label, suite.id).toBeTruthy()
          expect(option.tags.length, `${suite.id} tags`).toBeGreaterThan(0)
        }
      }
    }
  })
})
