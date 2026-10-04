import { describe, it, expect } from 'vitest'
import { GOAL_OPTIONS } from './constants.js'

describe('GOAL_OPTIONS — category and taskType completeness', () => {
  it('image-generation goal has image in taskTypes', () => {
    const g = GOAL_OPTIONS.find((g) => g.id === 'image-generation')
    expect(g?.taskTypes).toContain('image')
  })

  it('learning goal has explain in taskTypes', () => {
    const g = GOAL_OPTIONS.find((g) => g.id === 'learning')
    expect(g?.taskTypes).toContain('explain')
  })

  it('business-productivity goal has strategy in taskTypes', () => {
    const g = GOAL_OPTIONS.find((g) => g.id === 'business-productivity')
    expect(g?.taskTypes).toContain('strategy')
  })

  it('research-analysis goal targets Research category', () => {
    const g = GOAL_OPTIONS.find((g) => g.id === 'research-analysis')
    expect(g?.categories).toContain('Research')
  })

  it('coding-development goal targets Engineering category', () => {
    const g = GOAL_OPTIONS.find((g) => g.id === 'coding-development')
    expect(g?.categories).toContain('Engineering')
  })

  it('all goals have non-empty descriptions', () => {
    for (const goal of GOAL_OPTIONS) {
      expect(typeof goal.description).toBe('string')
      expect(goal.description.trim().length).toBeGreaterThan(0)
    }
  })

  it('all goals have non-empty labels', () => {
    for (const goal of GOAL_OPTIONS) {
      expect(goal.label.trim().length).toBeGreaterThan(0)
    }
  })

  it('goal labels are unique', () => {
    const labels = GOAL_OPTIONS.map((g) => g.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('no goal has empty categories array', () => {
    for (const goal of GOAL_OPTIONS) {
      expect(goal.categories.length).toBeGreaterThan(0)
    }
  })

  it('no goal has empty taskTypes array', () => {
    for (const goal of GOAL_OPTIONS) {
      expect(goal.taskTypes.length).toBeGreaterThan(0)
    }
  })
})
