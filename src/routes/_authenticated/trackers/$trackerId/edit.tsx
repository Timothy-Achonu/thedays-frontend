import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ROUTES } from '@/lib/constants/routes'
import { useCurrentUserQuery } from '@/lib/app/auth'
import {
  trackerQueryOptions,
  useUpdateTrackerMutation,
} from '@/lib/app/trackers'
import { TrackerForm } from '@/features/trackers/components/tracker-form'
import {
  getCalendarDateInTimezone,
  getDefaultTimezone,
} from '@/lib/utils/timezone'

export const Route = createFileRoute(
  '/_authenticated/trackers/$trackerId/edit',
)({
  component: EditTrackerPage,
})

function EditTrackerPage() {
  const navigate = useNavigate()
  const { trackerId } = Route.useParams()
  const { data: user } = useCurrentUserQuery()
  const trackerQuery = useQuery(trackerQueryOptions(trackerId))
  const updateMutation = useUpdateTrackerMutation()

  const today = useMemo(
    () => getCalendarDateInTimezone(user?.timezone ?? getDefaultTimezone()),
    [user?.timezone],
  )

  const tracker = trackerQuery.data?.tracker

  if (trackerQuery.isLoading) {
    return (
      <div className="min-h-[calc(100dvh-4.5rem)] bg-earth-50 px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-2xl animate-pulse-soft space-y-4">
          <div className="h-5 w-40 rounded bg-earth-200" />
          <div className="h-10 w-3/4 rounded bg-earth-200" />
          <div className="h-72 rounded-3xl border border-earth-100 bg-white/70" />
        </div>
      </div>
    )
  }

  if (trackerQuery.isError || !tracker) {
    return (
      <div className="min-h-[calc(100dvh-4.5rem)] bg-earth-50 px-5 py-16 text-center">
        <p className="font-display text-2xl font-semibold text-earth-900">
          This tracker could not be loaded.
        </p>
        <p className="mt-2 text-earth-600">
          It may have been deleted, or you may not have access to it.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: ROUTES.dashboard })}
          className="mt-6 rounded-xl px-4 py-2.5 text-sm font-semibold text-terracotta-600 transition-colors hover:bg-terracotta-50 focus-ring"
        >
          Back to dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100dvh-4.5rem)] overflow-hidden bg-earth-50 px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border-[52px] border-sand-200/50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-sage-100/60 blur-3xl"
      />

      <div className="relative mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => navigate({ to: ROUTES.trackers.detail(tracker.id) })}
          className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-earth-500 transition-colors hover:text-earth-800 focus-ring"
        >
          ← Back to tracker
        </button>

        <header className="mb-9 mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
            Refine the count
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-earth-900 sm:text-5xl">
            Edit tracker
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-earth-600">
            Adjust “{tracker.title}”. Your {tracker.daysCount.toLocaleString()}{' '}
            completed{' '}
            {tracker.daysCount === 1
              ? 'day stays exactly where it is'
              : 'days stay exactly where they are'}
            .
          </p>
        </header>

        <section className="rounded-3xl border border-earth-100 bg-white p-6 shadow-organic-md sm:p-8">
          <TrackerForm
            mode="edit"
            today={today}
            initialTitle={tracker.title}
            initialDescription={tracker.description}
            initialStartDate={tracker.startDate}
            currentCompletionMode={tracker.completionMode}
            submitLabel="Save changes"
            pendingLabel="Saving…"
            isPending={updateMutation.isPending}
            onSubmit={(payload) =>
              updateMutation.mutateAsync({
                trackerId: tracker.id,
                input: {
                  title: payload.title,
                  description: payload.description,
                  startDate: payload.startDate,
                },
              })
            }
            onCancel={() =>
              navigate({ to: ROUTES.trackers.detail(tracker.id) })
            }
          />
        </section>
      </div>
    </div>
  )
}
