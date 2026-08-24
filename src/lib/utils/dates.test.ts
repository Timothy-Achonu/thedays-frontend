import { describe, expect, it } from 'vitest'
import { inclusiveDayCount, latestDayWindow } from './dates'

describe('bounded calendar history', () => {
  it('counts inclusively and generates only the requested newest batch', () => {
    const total = inclusiveDayCount('1000-01-01', '2026-08-24')
    const visible = latestDayWindow('1000-01-01', '2026-08-24', 30)
    expect(total).toBeGreaterThan(300_000)
    expect(visible).toHaveLength(30)
    expect(visible[0]).toBe('2026-08-24')
    expect(visible.at(-1)).toBe('2026-07-26')
  })
})
