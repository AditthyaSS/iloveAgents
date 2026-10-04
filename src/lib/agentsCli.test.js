import { describe, it, expect } from 'vitest'
import { searchAgents, formatAgentLine } from './agentsCli'

const sample = [
  { id: 'sql-query-generator', name: 'SQL Query Generator', description: 'Turns English into SQL', category: 'Engineering' },
  { id: 'meal-planner-agent', name: 'Meal Planner', description: 'Weekly meals', category: 'Productivity' },
]

describe('agentsCli', () => {
  it('searches across id, name and category', () => {
    expect(searchAgents(sample, 'sql')).toHaveLength(1)
    expect(searchAgents(sample, 'productivity')[0].id).toBe('meal-planner-agent')
    expect(searchAgents(sample, '')).toHaveLength(2)
  })

  it('formats one line per agent', () => {
    expect(formatAgentLine(sample[0])).toBe('sql-query-generator | SQL Query Generator | Engineering')
  })
})
