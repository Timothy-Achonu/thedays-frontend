import { useQueries } from '@tanstack/react-query'
import { getTrackerDailyStatus } from '../daily-status'
import type { Tracker } from '@/types/trackers'
import type { TrackerDailyStatus } from '../daily-status'
import { completedDaysQueryOptions, useTrackersQuery } from '@/lib/app/trackers'

export interface TrackerWithDays {
  tracker: Tracker
  completedDates: ReadonlySet<string>
  badDates: ReadonlySet<string>
  status: TrackerDailyStatus | null
  statusState: 'loading' | 'ready' | 'failed'
}

/**
 * Trackers enriched with completed and bad-date sets so dashboard cards can
 * show live today/yesterday status. One small query per tracker, in parallel.
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
      const query = dayQueries[index]

      if (query.isError) {
        return {
          tracker,
          completedDates: new Set(daysData?.dates ?? []),
          badDates: new Set(daysData?.badDates ?? []),
          status: null,
          statusState: 'failed',
        }
      }

      if (!daysData || !today) {
        return {
          tracker,
          completedDates: new Set<string>(),
          badDates: new Set<string>(),
          status: null,
          statusState: 'loading',
        }
      }

      const completedDates = new Set(daysData.dates)
      const badDates = new Set(daysData.badDates)
      return {
        tracker,
        completedDates,
        badDates,
        status: getTrackerDailyStatus(tracker, completedDates, badDates, today),
        statusState: 'ready',
      }
    },
  )
  const areDaysLoading =
    trackers.length > 0 &&
    dayQueries.some((query) => query.isLoading && query.fetchStatus !== 'idle')

  return {
    trackers: trackersWithDays,
    isLoading: trackersQuery.isLoading,
    isInitialError: trackersQuery.isError && !trackersQuery.data,
    isBackgroundError: trackersQuery.isError && Boolean(trackersQuery.data),
    isDaysLoading: areDaysLoading,
    error: trackersQuery.error,
    retryTrackers: trackersQuery.refetch,
    hasFailedStatuses: dayQueries.some((query) => query.isError),
    retryFailedStatuses: () =>
      Promise.all(
        dayQueries
          .filter((query) => query.isError)
          .map((query) => query.refetch()),
      ),
  }
}
