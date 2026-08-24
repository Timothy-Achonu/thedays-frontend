import { useQueries } from '@tanstack/react-query'
import { getTrackerDailyStatus } from '../daily-status'
import type { Tracker } from '@/types/trackers'
import type { TrackerDailyStatus } from '../daily-status'
import { completedDaysQueryOptions, useTrackersQuery } from '@/lib/app/trackers'

export interface TrackerWithDays {
  tracker: Tracker
  completedDates: ReadonlySet<string>
  status: TrackerDailyStatus | null
}

/**
 * Trackers enriched with their completed-day sets so dashboard cards can show
 * live today/yesterday status. One small query per tracker, in parallel.
 */
export function useTrackersWithDays(today: string | undefined) {
  const trackersQuery = useTrackersQuery()
  const trackers = trackersQuery.data?.trackers ?? []

  const dayQueries = useQueries({
    queries: trackers.map((tracker) => completedDaysQueryOptions(tracker.id)),
  })

  // Cheap derivation; recomputing per render keeps index alignment obvious.
  const trackersWithDays: Array<TrackerWithDays> = trackers.map(
    (tracker, index) => {
      const daysData = dayQueries[index]?.data

      if (!daysData || !today) {
        return { tracker, completedDates: new Set<string>(), status: null }
      }

      const completedDates = new Set(daysData.dates)
      return {
        tracker,
        completedDates,
        status: getTrackerDailyStatus(tracker, completedDates, today),
      }
    },
  )
  const areDaysLoading =
    trackers.length > 0 &&
    dayQueries.some((query) => query.isLoading && query.fetchStatus !== 'idle')

  return {
    trackers: trackersWithDays,
    isLoading: trackersQuery.isLoading,
    isDaysLoading: areDaysLoading,
    error: trackersQuery.error,
  }
}
