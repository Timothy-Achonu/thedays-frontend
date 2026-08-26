import confetti from 'canvas-confetti'

/** Default duration for the dual corner confetti burst. */
export const CORNER_CONFETTI_MS = 2_500

const LEFT_COLORS = ['#f08b6b', '#c4704a', '#deccb0', '#d1b892']
const RIGHT_COLORS = ['#7c9a82', '#5e7d64', '#a8c3b0', '#cddcd2']

type FireCornerConfettiOptions = {
  /** How long confetti keeps firing. Defaults to {@link CORNER_CONFETTI_MS}. */
  durationMs?: number
}

let stopCurrentBurst: (() => void) | null = null

/**
 * Dual bottom-corner confetti burst in TheDays terracotta / sand / sage.
 * Returns a cleanup that cancels the RAF loop. A later call cancels any
 * burst still in progress.
 */
export function fireCornerConfetti({
  durationMs = CORNER_CONFETTI_MS,
}: FireCornerConfettiOptions = {}): () => void {
  stopCurrentBurst?.()

  const end = Date.now() + durationMs
  let raf = 0

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: LEFT_COLORS,
      disableForReducedMotion: true,
    })
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: RIGHT_COLORS,
      disableForReducedMotion: true,
    })
    if (Date.now() < end) raf = requestAnimationFrame(frame)
  }

  frame()

  const stop = () => {
    cancelAnimationFrame(raf)
    if (stopCurrentBurst === stop) stopCurrentBurst = null
  }

  stopCurrentBurst = stop
  return stop
}
