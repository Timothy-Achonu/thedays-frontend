import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCalendarDate } from './use-calendar-date'

let currentDate = '2026-08-24'
vi.mock('@/lib/utils/timezone', () => ({
  getCalendarDateInTimezone: vi.fn((timezone: string) =>
    timezone === 'Pacific/Auckland' ? '2026-08-25' : currentDate,
  ),
}))

describe('useCalendarDate', () => {
  afterEach(() => {
    vi.useRealTimers()
    currentDate = '2026-08-24'
  })

  it('refreshes on the interval, focus, visibility, and timezone changes', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ timezone }) => useCalendarDate(timezone),
      { initialProps: { timezone: 'UTC' } },
    )
    expect(result.current).toBe('2026-08-24')

    currentDate = '2026-08-25'
    act(() => vi.advanceTimersByTime(60_000))
    expect(result.current).toBe('2026-08-25')

    currentDate = '2026-08-26'
    act(() => window.dispatchEvent(new Event('focus')))
    expect(result.current).toBe('2026-08-26')

    currentDate = '2026-08-27'
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(result.current).toBe('2026-08-27')

    rerender({ timezone: 'Pacific/Auckland' })
    expect(result.current).toBe('2026-08-25')
  })

  it('cleans up timers and listeners', () => {
    vi.useFakeTimers()
    const removeWindow = vi.spyOn(window, 'removeEventListener')
    const removeDocument = vi.spyOn(document, 'removeEventListener')
    const { unmount } = renderHook(() => useCalendarDate('UTC'))
    unmount()
    expect(vi.getTimerCount()).toBe(0)
    expect(removeWindow).toHaveBeenCalledWith('focus', expect.any(Function))
    expect(removeDocument).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
  })
})
