import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  TRACKERS_QUERY_KEY,
  completedDaysQueryKey,
  landmarksQueryKey,
  trackerQueryKey,
} from './queries'
import {
  checkAllCompletedDays,
  clearAllCompletedDays,
  createLandmark,
  createTracker,
  deleteLandmark,
  deleteTracker,
  markCompletedDay,
  unmarkCompletedDay,
  updateLandmark,
  updateTracker,
} from './services'
import type {
  CompletedDaysResponse,
  CreateLandmarkInput,
  CreateTrackerInput,
  LandmarksResponse,
  MarkCompletedDayInput,
  Tracker,
  UnmarkCompletedDayInput,
  UpdateLandmarkInput,
  UpdateTrackerInput,
} from '@/types/trackers'
import { insertDateSorted, removeDate } from '@/lib/utils/dates'
import { fireCornerConfetti } from '@/lib/utils/fire-corner-confetti'
import { getNewlyReachedLandmarks } from '@/features/landmarks/newly-reached'
import { ROUTES } from '@/lib/constants/routes'

type OptimisticContext = {
  previousCompletedDays?: CompletedDaysResponse
}

export const COMPLETED_DAY_MUTATION_KEY = ['completed-day-mutations'] as const
export const BULK_COMPLETED_DAY_MUTATION_KEY = [
  ...COMPLETED_DAY_MUTATION_KEY,
  'bulk',
] as const

async function refreshCompletionDependentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  trackerId: string,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: trackerQueryKey(trackerId) })
  await queryClient.refetchQueries({
    queryKey: TRACKERS_QUERY_KEY,
    exact: true,
  })
}

function celebrateIfLandmarksReached(
  queryClient: ReturnType<typeof useQueryClient>,
  trackerId: string,
  previousCount: number,
  nextCount: number,
): void {
  const cached = queryClient.getQueryData<LandmarksResponse>(
    landmarksQueryKey(trackerId),
  )
  if (!cached) return
  if (
    getNewlyReachedLandmarks(cached.landmarks, previousCount, nextCount)
      .length === 0
  ) {
    return
  }
  fireCornerConfetti()
}

export function useCreateTrackerMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (input: CreateTrackerInput): Promise<Tracker> => {
      const response = await createTracker(input)
      return response.tracker
    },
    onSuccess: (tracker) => {
      // Cache the API envelope shape ({ tracker }) so consumers of
      // trackerQueryOptions see a consistent structure.
      queryClient.setQueryData(trackerQueryKey(tracker.id), { tracker })
      queryClient.setQueryData(completedDaysQueryKey(tracker.id), {
        dates: [],
        total: 0,
      })
      queryClient.invalidateQueries({ queryKey: TRACKERS_QUERY_KEY })
      navigate({ to: ROUTES.trackers.detail(tracker.id) })
    },
  })
}

export function useUpdateTrackerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      trackerId,
      input,
    }: {
      trackerId: string
      input: UpdateTrackerInput
    }): Promise<Tracker> => {
      const response = await updateTracker(trackerId, input)
      return response.tracker
    },
    onSuccess: (tracker) => {
      queryClient.setQueryData(trackerQueryKey(tracker.id), { tracker })
      queryClient.invalidateQueries({ queryKey: TRACKERS_QUERY_KEY })
    },
  })
}

export function useDeleteTrackerMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (trackerId: string): Promise<void> => {
      await deleteTracker(trackerId)
    },
    onSuccess: (_data, trackerId) => {
      queryClient.removeQueries({ queryKey: trackerQueryKey(trackerId) })
      queryClient.invalidateQueries({ queryKey: TRACKERS_QUERY_KEY })
      navigate({ to: ROUTES.dashboard })
    },
  })
}

/**
 * Marks a day complete with an optimistic cache update. The cached date list
 * is patched immediately and rolled back on failure; counts and landmark
 * progress are refreshed via invalidation once the request settles.
 */
export function useMarkCompletedDayMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...COMPLETED_DAY_MUTATION_KEY, 'mark'],
    mutationFn: async (input: MarkCompletedDayInput): Promise<void> => {
      await markCompletedDay(input)
    },
    onMutate: async (input): Promise<OptimisticContext> => {
      const queryKey = completedDaysQueryKey(input.trackerId)
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<CompletedDaysResponse>(queryKey)

      if (previous && !previous.dates.includes(input.date)) {
        queryClient.setQueryData<CompletedDaysResponse>(queryKey, {
          ...previous,
          dates: insertDateSorted(previous.dates, input.date),
          total: previous.total + 1,
        })
      }

      return { previousCompletedDays: previous }
    },
    onError: (_error, input, context) => {
      if (context?.previousCompletedDays) {
        queryClient.setQueryData(
          completedDaysQueryKey(input.trackerId),
          context.previousCompletedDays,
        )
      }
    },
    onSuccess: (_data, input, context) => {
      const previous = context.previousCompletedDays
      if (!previous || previous.dates.includes(input.date)) return
      celebrateIfLandmarksReached(
        queryClient,
        input.trackerId,
        previous.total,
        previous.total + 1,
      )
    },
    onSettled: () => {
      // Active tracker queries (detail page, landmarks, completed-days)
      // refetch immediately via invalidation...
      void queryClient.invalidateQueries({ queryKey: TRACKERS_QUERY_KEY })
      // ...while the dashboard list query is inactive at this point, and
      // refetchOnMount is disabled app-wide, so refetch it exactly here to
      // keep dashboard daysCount correct on return.
      void queryClient.refetchQueries({
        queryKey: TRACKERS_QUERY_KEY,
        exact: true,
      })
    },
  })
}

/**
 * Unmarks a day with an optimistic cache update, mirroring the mark flow.
 */
export function useUnmarkCompletedDayMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...COMPLETED_DAY_MUTATION_KEY, 'unmark'],
    mutationFn: async (input: UnmarkCompletedDayInput): Promise<void> => {
      await unmarkCompletedDay(input)
    },
    onMutate: async (input): Promise<OptimisticContext> => {
      const queryKey = completedDaysQueryKey(input.trackerId)
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<CompletedDaysResponse>(queryKey)

      if (previous?.dates.includes(input.date)) {
        queryClient.setQueryData<CompletedDaysResponse>(queryKey, {
          ...previous,
          dates: removeDate(previous.dates, input.date),
          total: Math.max(0, previous.total - 1),
        })
      }

      return { previousCompletedDays: previous }
    },
    onError: (_error, input, context) => {
      if (context?.previousCompletedDays) {
        queryClient.setQueryData(
          completedDaysQueryKey(input.trackerId),
          context.previousCompletedDays,
        )
      }
    },
    onSettled: () => {
      // Same refresh strategy as the mark flow (see above).
      void queryClient.invalidateQueries({ queryKey: TRACKERS_QUERY_KEY })
      void queryClient.refetchQueries({
        queryKey: TRACKERS_QUERY_KEY,
        exact: true,
      })
    },
  })
}

export function useCheckAllCompletedDaysMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...BULK_COMPLETED_DAY_MUTATION_KEY, 'check'],
    mutationFn: checkAllCompletedDays,
    onSuccess: (response, trackerId) => {
      const previous = queryClient.getQueryData<CompletedDaysResponse>(
        completedDaysQueryKey(trackerId),
      )
      const previousCount = previous?.total ?? response.total - response.added
      celebrateIfLandmarksReached(
        queryClient,
        trackerId,
        previousCount,
        response.total,
      )
      return refreshCompletionDependentQueries(queryClient, trackerId)
    },
  })
}

export function useClearAllCompletedDaysMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...BULK_COMPLETED_DAY_MUTATION_KEY, 'clear'],
    mutationFn: clearAllCompletedDays,
    onSuccess: (_response, trackerId) =>
      refreshCompletionDependentQueries(queryClient, trackerId),
  })
}

export function useCreateLandmarkMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      trackerId,
      input,
    }: {
      trackerId: string
      input: CreateLandmarkInput
    }) => {
      const response = await createLandmark(trackerId, input)
      return response.landmark
    },
    onSuccess: (_landmark, variables) => {
      void queryClient.invalidateQueries({
        queryKey: landmarksQueryKey(variables.trackerId),
      })
    },
  })
}

export function useUpdateLandmarkMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      trackerId,
      landmarkId,
      input,
    }: {
      trackerId: string
      landmarkId: string
      input: UpdateLandmarkInput
    }) => {
      const response = await updateLandmark(trackerId, landmarkId, input)
      return response.landmark
    },
    onSuccess: (_landmark, variables) => {
      void queryClient.invalidateQueries({
        queryKey: landmarksQueryKey(variables.trackerId),
      })
    },
  })
}

export function useDeleteLandmarkMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      trackerId,
      landmarkId,
    }: {
      trackerId: string
      landmarkId: string
    }): Promise<void> => {
      await deleteLandmark(trackerId, landmarkId)
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: landmarksQueryKey(variables.trackerId),
      })
    },
  })
}
