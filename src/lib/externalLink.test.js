import { describe, it, expect, vi, afterEach } from 'vitest'
import { openExternal } from './externalLink'

describe('openExternal', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('opens with noopener and clears the reference', () => {
    const popup = { opener: 'something' }
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(popup)
    const result = openExternal('https://example.com')
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener')
    expect(popup.opener).toBeNull()
    expect(result).toBe(popup)
  })

  it('returns null when the popup is blocked', () => {
    vi.spyOn(window, 'open').mockReturnValue(null)
    expect(openExternal('https://example.com')).toBeNull()
  })
})
