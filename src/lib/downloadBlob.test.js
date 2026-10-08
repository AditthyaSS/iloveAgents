import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { downloadBlob } from './downloadBlob'

beforeEach(() => {
  vi.useFakeTimers()
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock')
  globalThis.URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('downloadBlob', () => {
  it('appends, clicks, removes, and revokes after the delay', () => {
    const anchor = document.createElement('a')
    const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => {})
    const removeSpy = vi.spyOn(anchor, 'remove').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue(anchor)
    const appendSpy = vi.spyOn(document.body, 'appendChild')

    const url = downloadBlob('hello', 'text/plain', 'hello.txt', { revokeDelayMs: 2000 })

    expect(url).toBe('blob:mock')
    expect(appendSpy).toHaveBeenCalledTimes(1)
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(removeSpy).toHaveBeenCalledTimes(1)
    expect(globalThis.URL.revokeObjectURL).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2000)
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock')
  })

  it('accepts a prebuilt Blob', () => {
    const anchor = document.createElement('a')
    vi.spyOn(anchor, 'click').mockImplementation(() => {})
    vi.spyOn(anchor, 'remove').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue(anchor)
    const blob = new Blob(['x'], { type: 'text/plain' })
    expect(downloadBlob(blob, 'text/plain', 'x.txt')).toBe('blob:mock')
  })
})
