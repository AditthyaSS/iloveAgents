import { describe, it, expect, vi, afterEach } from 'vitest'
import { copyText } from './clipboard'

describe('copyText', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses the clipboard api when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    await expect(copyText('hello')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('hello')
  })

  it('returns false instead of throwing when clipboard rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.assign(navigator, { clipboard: { writeText } })
    document.execCommand = vi.fn().mockReturnValue(false)
    await expect(copyText('hello')).resolves.toBe(false)
  })

  it('falls back to textarea when clipboard api is missing', async () => {
    Object.assign(navigator, { clipboard: undefined })
    document.execCommand = vi.fn().mockReturnValue(true)
    await expect(copyText('hello')).resolves.toBe(true)
    expect(document.execCommand).toHaveBeenCalledWith('copy')
  })
})
