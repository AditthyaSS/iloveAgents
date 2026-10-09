import { describe, it, expect, beforeEach } from 'vitest'
import { saveRuns, loadRuns } from './automationsService'

beforeEach(() => {
  localStorage.clear()
})

describe('automation runs cap', () => {
  it('keeps only the newest runs', () => {
    const runs = Array.from({ length: 130 }, (_, i) => ({ id: `r${i}` }))
    saveRuns(runs)
    const stored = loadRuns()
    expect(stored).toHaveLength(100)
    expect(stored[0].id).toBe('r0')
  })
})
