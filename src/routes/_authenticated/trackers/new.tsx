import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants/routes'
import { useCurrentUserQuery } from '@/lib/app/auth'
import { useCreateTrackerMutation } from '@/lib/app/trackers'
import { TrackerForm } from '@/features/trackers/components/tracker-form'
import { getDefaultTimezone } from '@/lib/utils/timezone'
import { useCalendarDate } from '@/hooks/use-calendar-date'

export const Route = createFileRoute('/_authenticated/trackers/new')({
  component: NewTrackerPage,
})

function NewTrackerPage() {
  const navigate = useNavigate()
  const { data: user } = useCurrentUserQuery()
  const createMutation = useCreateTrackerMutation()

  const today = useCalendarDate(user?.timezone ?? getDefaultTimezone())

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
        <Link
          to={ROUTES.dashboard}
          className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-earth-500 transition-colors hover:text-earth-800 focus-ring"
        >
          ← All trackers
        </Link>

        <header className="mb-9 mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
            Begin a count
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-earth-900 sm:text-5xl">
            Create a tracker
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-earth-600">
            Name the thing you want to count, choose when it began, and decide
            whether you are practising a habit or abstaining from one.
          </p>
        </header>

        <section className="rounded-3xl border border-earth-100 bg-white p-6 shadow-organic-md sm:p-8">
          <TrackerForm
            mode="create"
            today={today}
            submitLabel="Create tracker"
            pendingLabel="Creating…"
            isPending={createMutation.isPending}
            onSubmit={(payload) =>
              createMutation.mutateAsync({
                title: payload.title,
                description: payload.description ?? undefined,
                startDate: payload.startDate,
                completionMode: payload.completionMode!,
              })
            }
            onCancel={() => navigate({ to: ROUTES.dashboard })}
          />
        </section>
      </div>
    </div>
  )
}
