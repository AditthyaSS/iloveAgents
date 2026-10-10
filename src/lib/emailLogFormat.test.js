import { describe, it, expect } from 'vitest'
import { buildEmailPreview, formatEmailDuration } from './automationsService'

describe('email log formatting', () => {
  it('marks truncation honestly', () => {
    expect(buildEmailPreview('short', null)).toBe('short')
    expect(buildEmailPreview('x'.repeat(200), null)).toMatch(/\.\.\.$/)
    expect(buildEmailPreview('', 'oops')).toBe('oops')
    expect(buildEmailPreview(null, null)).toBe('Run finished')
  })

  it('never renders NaN durations', () => {
    expect(formatEmailDuration(1500)).toBe('1.50s')
    expect(formatEmailDuration(null)).toBe('—')
    expect(formatEmailDuration(undefined)).toBe('—')
    expect(formatEmailDuration(NaN)).toBe('—')
  })
})
