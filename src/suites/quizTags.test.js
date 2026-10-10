import { describe, it, expect } from 'vitest'
import { loadAllAgents } from '../agents/registry'
import { suites } from './suitesData'

function quizTags() {
  const tags = []
  for (const suite of suites) {
    for (const question of suite.quiz?.questions ?? []) {
      for (const option of question.options ?? []) {
        tags.push(...(option.tags ?? []))
      }
    }
  }
  return tags
}

describe('suite quiz tags', () => {
  it('every quiz tag resolves to a registry agent', async () => {
    const agents = await loadAllAgents()
    const ids = new Set(agents.map((a) => a.id))
    const missing = [...new Set(quizTags())].filter((tag) => !ids.has(tag))
    expect(missing).toEqual([])
  })
})
