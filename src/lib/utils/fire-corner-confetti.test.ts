import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireCornerConfetti } from './fire-corner-confetti'

const confetti = vi.hoisted(() => vi.fn())

vi.mock('canvas-confetti', () => ({
  default: confetti,
}))

describe('fireCornerConfetti', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    confetti.mockReset()
  })

  it('fires both corners with reduced-motion disabled', () => {
    vi.stubGlobal('requestAnimationFrame', () => 1)
    vi.stubGlobal('cancelAnimationFrame', vi.fn())

    fireCornerConfetti({ durationMs: 0 })

    expect(confetti).toHaveBeenCalledTimes(2)
    expect(confetti.mock.calls[0]?.[0]).toMatchObject({
      origin: { x: 0 },
      disableForReducedMotion: true,
    })
    expect(confetti.mock.calls[1]?.[0]).toMatchObject({
      origin: { x: 1 },
      disableForReducedMotion: true,
    })
  })

  it('cancels an in-progress burst when fired again', () => {
    const cancelAnimationFrame = vi.fn()
    vi.stubGlobal('requestAnimationFrame', () => 42)
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame)

    fireCornerConfetti({ durationMs: 5_000 })
    fireCornerConfetti({ durationMs: 0 })

    expect(cancelAnimationFrame).toHaveBeenCalledWith(42)
  })
})
