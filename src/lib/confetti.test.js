import { afterEach, describe, expect, it, vi } from 'vitest'
import { launchConfetti } from './confetti'

describe('launchConfetti', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('adds a canvas and removes it when cleaned up', () => {
    const cleanup = launchConfetti({ duration: 100, particleCount: 5 })

    expect(document.querySelector('canvas')).not.toBeNull()

    cleanup()

    expect(document.querySelector('canvas')).toBeNull()
  })

  it('returns safely when Canvas 2D context is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)

    expect(() => launchConfetti()).not.toThrow()
    expect(document.querySelector('canvas')).toBeNull()
  })

  it('returns safely when Canvas getContext throws', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      throw new Error('Canvas unavailable')
    })

    expect(() => launchConfetti()).not.toThrow()
    expect(document.querySelector('canvas')).toBeNull()
  })
})
