import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Landmark } from '@/types/trackers'
import type { LandmarkFormPayload } from '@/features/landmarks/components/landmark-form-dialog'
import {
  completedDaysQueryOptions,
  landmarksQueryOptions,
  trackerQueryOptions,
  useCreateLandmarkMutation,
  useDeleteLandmarkMutation,
  useDeleteTrackerMutation,
  useUpdateLandmarkMutation,
} from '@/lib/app/trackers'
import { useCurrentUserQuery } from '@/lib/app/auth'
import { TrackerHeader } from '@/features/trackers/components/tracker-header'
import { DeleteTrackerDialog } from '@/features/trackers/components/delete-tracker-dialog'
import { TodayCard } from '@/features/completed-days/components/today-card'
import { DayList } from '@/features/completed-days/components/day-list'
import { BulkDayActions } from '@/features/completed-days/components/bulk-day-actions'
import { LandmarkCard } from '@/features/landmarks/components/landmark-card'
import { NextLandmarkCard } from '@/features/landmarks/components/next-landmark-card'
import {
  DeleteLandmarkDialog,
  LandmarkFormDialog,
} from '@/features/landmarks/components/landmark-form-dialog'
import { getDefaultTimezone } from '@/lib/utils/timezone'
import { useCalendarDate } from '@/hooks/use-calendar-date'

export const Route = createFileRoute('/_authenticated/trackers/$trackerId/')({
  component: TrackerDetailPage,
})

function TrackerDetailPage() {
  const { trackerId } = Route.useParams()
  const { data: user } = useCurrentUserQuery()

  const today = useCalendarDate(user?.timezone ?? getDefaultTimezone())

  const trackerQuery = useQuery(trackerQueryOptions(trackerId))
  const daysQuery = useQuery(completedDaysQueryOptions(trackerId))
  const landmarksQuery = useQuery(landmarksQueryOptions(trackerId))

  const deleteTrackerMutation = useDeleteTrackerMutation()
  const createLandmarkMutation = useCreateLandmarkMutation()
  const updateLandmarkMutation = useUpdateLandmarkMutation()
  const deleteLandmarkMutation = useDeleteLandmarkMutation()

  const [isDeleteTrackerOpen, setIsDeleteTrackerOpen] = useState(false)
  const [deleteTrackerError, setDeleteTrackerError] = useState<string | null>(
    null,
  )
  const [dayError, setDayError] = useState<string | null>(null)

  const [landmarkFormState, setLandmarkFormState] = useState<
    'closed' | 'create' | { edit: Landmark }
  >('closed')
  const [landmarkToDelete, setLandmarkToDelete] = useState<Landmark | null>(
    null,
  )
  const [landmarkError, setLandmarkError] = useState<string | null>(null)

  const tracker = trackerQuery.data?.tracker

  if (trackerQuery.isLoading) {
    return <DetailSkeleton />
  }

  if (trackerQuery.isError || !tracker) {
    return (
      <div className="min-h-[calc(100dvh-4.5rem)] bg-earth-50 px-5 py-16 text-center">
        <p className="font-display text-3xl font-semibold text-earth-900">
          This tracker could not be found.
        </p>
        <p className="mt-2 text-earth-600">
          It may have been deleted, or it may belong to another account.
        </p>
      </div>
    )
  }

  const hasCompletionData = Boolean(daysQuery.data)
  const completedDates = new Set(daysQuery.data?.dates ?? [])
  const landmarks = landmarksQuery.data?.landmarks ?? []

  const submitLandmark = (payload: LandmarkFormPayload) => {
    setLandmarkError(null)

    if (typeof landmarkFormState === 'object') {
      return updateLandmarkMutation.mutateAsync({
        trackerId: tracker.id,
        landmarkId: landmarkFormState.edit.id,
        input: {
          title: payload.title === '' ? null : payload.title,
          targetCount: payload.targetCount,
          celebrationDescription: payload.celebrationDescription,
        },
      })
    }

    return createLandmarkMutation.mutateAsync({
      trackerId: tracker.id,
      input: {
        ...(payload.title === '' ? {} : { title: payload.title }),
        targetCount: payload.targetCount,
        celebrationDescription: payload.celebrationDescription,
      },
    })
  }

  return (
    <div className="relative min-h-[calc(100dvh-4.5rem)] overflow-hidden bg-earth-50 px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-sand-200/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl space-y-8">
        <TrackerHeader
          tracker={tracker}
          onDelete={() => {
            setDeleteTrackerError(null)
            setIsDeleteTrackerOpen(true)
          }}
        />

        {!hasCompletionData && daysQuery.isPending ? (
          <div className="h-36 animate-pulse-soft rounded-3xl border border-earth-100 bg-white/70" aria-label="Completion controls loading" />
        ) : !hasCompletionData && daysQuery.isError ? (
          <CompletionLoadError onRetry={() => void daysQuery.refetch()} />
        ) : (
          <TodayCard tracker={tracker} completedDates={completedDates} today={today} onError={setDayError} />
        )}

        {hasCompletionData && daysQuery.isError ? (
          <p role="status" className="rounded-xl border border-sand-300 bg-sand-100 px-4 py-3 text-sm text-sand-900">
            Completion history could not be refreshed. Showing the last loaded data.
          </p>
        ) : null}

        {dayError ? (
          <p
            role="alert"
            className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700"
          >
            {dayError}
          </p>
        ) : null}

        <NextLandmarkCard landmarks={landmarks} />

        <section aria-label="Landmarks" className="space-y-4">
          <header className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-earth-900">
              Landmarks
            </h2>
            <button
              type="button"
              onClick={() => {
                setLandmarkError(null)
                setLandmarkFormState('create')
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-terracotta-300 bg-transparent px-3.5 py-2 text-sm font-semibold text-terracotta-600 transition-colors hover:border-terracotta-400 hover:bg-terracotta-50 focus-ring"
            >
              <PlusIcon />
              Add landmark
            </button>
          </header>

          {landmarksQuery.isLoading ? (
            <div
              className="grid animate-pulse-soft gap-4 sm:grid-cols-2"
              aria-hidden="true"
            >
              <div className="h-44 rounded-2xl border border-earth-100 bg-white/70" />
              <div className="h-44 rounded-2xl border border-earth-100 bg-white/70" />
            </div>
          ) : landmarks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-earth-300 bg-white/60 p-8 text-center">
              <p className="font-medium text-earth-800">No landmarks yet.</p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-earth-500">
                Add a target and define how you will celebrate reaching it.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {landmarks.map((landmark) => (
                <LandmarkCard
                  key={landmark.id}
                  landmark={landmark}
                  onEdit={() => {
                    setLandmarkError(null)
                    setLandmarkFormState({ edit: landmark })
                  }}
                  onDelete={() => setLandmarkToDelete(landmark)}
                  isBusy={
                    updateLandmarkMutation.isPending ||
                    deleteLandmarkMutation.isPending
                  }
                />
              ))}
            </div>
          )}

          {landmarkError ? (
            <p role="alert" className="text-sm text-error-600">
              {landmarkError}
            </p>
          ) : null}
        </section>

        <section aria-label="Day history" className="space-y-4">
          <h2 className="font-display text-2xl font-semibold text-earth-900">
            Day history
          </h2>

          {!hasCompletionData && daysQuery.isPending ? (
            <div className="animate-pulse-soft space-y-2" aria-hidden="true">
              <div className="mb-4 h-28 rounded-2xl border border-earth-100 bg-white/70" />
              {Array.from({ length: 5 }, (_, index) => (
                <div
                  key={index}
                  className="h-14 rounded-2xl border border-earth-100 bg-white/70"
                />
              ))}
            </div>
          ) : hasCompletionData ? (
            <>
              <BulkDayActions
                tracker={tracker}
                completedDates={completedDates}
                today={today}
              />
              <DayList
                tracker={tracker}
                completedDates={completedDates}
                today={today}
                onError={setDayError}
              />
            </>
          ) : null}
        </section>
      </div>

      <DeleteTrackerDialog
        open={isDeleteTrackerOpen}
        trackerTitle={tracker.title}
        daysCount={daysQuery.data?.total ?? tracker.daysCount}
        isDeleting={deleteTrackerMutation.isPending}
        error={deleteTrackerError}
        onConfirm={() => {
          deleteTrackerMutation.mutate(tracker.id, {
            onError: () =>
              setDeleteTrackerError(
                'The tracker could not be deleted. Please try again.',
              ),
          })
        }}
        onCancel={() => setIsDeleteTrackerOpen(false)}
      />

      <LandmarkFormDialog
        open={landmarkFormState !== 'closed'}
        landmark={
          typeof landmarkFormState === 'object' ? landmarkFormState.edit : null
        }
        isPending={
          createLandmarkMutation.isPending || updateLandmarkMutation.isPending
        }
        currentCount={tracker.daysCount}
        onSubmit={(payload) =>
          submitLandmark(payload).catch(() => {
            // Field-level errors are rendered inside the dialog; keep it open.
          })
        }
        onClose={() => setLandmarkFormState('closed')}
      />

      <DeleteLandmarkDialog
        landmark={landmarkToDelete}
        isPending={deleteLandmarkMutation.isPending}
        error={landmarkError}
        onConfirm={() => {
          if (!landmarkToDelete) return
          deleteLandmarkMutation.mutate(
            { trackerId: tracker.id, landmarkId: landmarkToDelete.id },
            {
              onSuccess: () => setLandmarkToDelete(null),
              onError: () =>
                setLandmarkError(
                  'The landmark could not be deleted. Please try again.',
                ),
            },
          )
        }}
        onCancel={() => setLandmarkToDelete(null)}
      />
    </div>
  )
}

function CompletionLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <section aria-disabled="true" className="rounded-3xl border border-error-200 bg-error-50 p-7 text-center">
      <p className="font-display text-xl font-semibold text-earth-900">Completion controls are unavailable.</p>
      <p className="mt-2 text-sm text-error-700">Load the authoritative completion history before changing any day.</p>
      <button type="button" onClick={onRetry} className="mt-4 rounded-xl border border-error-300 bg-white px-4 py-2 text-sm font-semibold text-error-700 focus-ring">Try again</button>
    </section>
  )
}

function DetailSkeleton() {
  return (
    <div
      className="min-h-[calc(100dvh-4.5rem)] bg-earth-50 px-5 py-10 sm:px-8"
      aria-busy="true"
    >
      <div className="mx-auto max-w-3xl animate-pulse-soft space-y-8">
        <div className="space-y-4">
          <div className="h-4 w-28 rounded bg-earth-200" />
          <div className="h-12 w-2/3 rounded bg-earth-200" />
          <div className="h-4 w-1/3 rounded bg-earth-100" />
        </div>
        <div className="h-32 rounded-3xl border border-earth-100 bg-white/70" />
        <div className="h-24 rounded-2xl border border-earth-100 bg-white/70" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-40 rounded-2xl border border-earth-100 bg-white/70" />
          <div className="h-40 rounded-2xl border border-earth-100 bg-white/70" />
        </div>
      </div>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
