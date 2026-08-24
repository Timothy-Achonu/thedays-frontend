import { queryOptions, useQuery } from '@tanstack/react-query'
import {
  getTracker,
  listCompletedDays,
  listLandmarks,
  listTrackers,
} from './services'

export const TRACKERS_QUERY_KEY = ['trackers'] as const

export function trackerQueryKey(trackerId: string) {
  return [...TRACKERS_QUERY_KEY, trackerId] as const
}

export function completedDaysQueryKey(trackerId: string) {
  return [...TRACKERS_QUERY_KEY, trackerId, 'completed-days'] as const
}

export function landmarksQueryKey(trackerId: string) {
  return [...TRACKERS_QUERY_KEY, trackerId, 'landmarks'] as const
}

export const trackersQueryOptions = queryOptions({
  queryKey: TRACKERS_QUERY_KEY,
  queryFn: ({ signal }) => listTrackers(signal),
})

export function trackerQueryOptions(trackerId: string) {
  return queryOptions({
    queryKey: trackerQueryKey(trackerId),
    queryFn: ({ signal }) => getTracker(trackerId, signal),
  })
}

export function completedDaysQueryOptions(trackerId: string) {
  return queryOptions({
    queryKey: completedDaysQueryKey(trackerId),
    queryFn: ({ signal }) => listCompletedDays(trackerId, signal),
  })
}

export function landmarksQueryOptions(trackerId: string) {
  return queryOptions({
    queryKey: landmarksQueryKey(trackerId),
    queryFn: ({ signal }) => listLandmarks(trackerId, signal),
  })
}

export function useTrackersQuery() {
  return useQuery(trackersQueryOptions)
}

export function useTrackerQuery(trackerId: string) {
  return useQuery(trackerQueryOptions(trackerId))
}

export function useCompletedDaysQuery(trackerId: string) {
  return useQuery(completedDaysQueryOptions(trackerId))
}

export function useLandmarksQuery(trackerId: string) {
  return useQuery(landmarksQueryOptions(trackerId))
}
