import { useEffect, useState } from 'react'
import { getCalendarDateInTimezone } from '@/lib/utils/timezone'

/** Keeps a timezone-aware YYYY-MM-DD value fresh across midnight and tab sleep. */
export function useCalendarDate(timezone: string): string {
  const [calendarDate, setCalendarDate] = useState(() =>
    getCalendarDateInTimezone(timezone),
  )

  useEffect(() => {
    const refresh = () => {
      const nextDate = getCalendarDateInTimezone(timezone)
      setCalendarDate((currentDate) =>
        currentDate === nextDate ? currentDate : nextDate,
      )
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    refresh()
    const intervalId = window.setInterval(refresh, 60_000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [timezone])

  return calendarDate
}
