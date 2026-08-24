import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { ROUTES } from '@/lib/constants/routes'
import { TimezoneMismatchBanner } from '@/components/timezone-mismatch-banner'
import { useCurrentUserQuery } from '@/lib/app/auth'
import { TrackerCard } from '@/features/trackers/components/tracker-card'
import { TrackersGridSkeleton } from '@/features/trackers/components/tracker-skeletons'
import { useTrackersWithDays } from '@/features/trackers/hooks/use-trackers-with-days'
import {
  getCalendarDateInTimezone,
  getDefaultTimezone,
} from '@/lib/utils/timezone'
import { cn } from '@/lib/utils/cn'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

const primaryLinkClasses = cn(
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-base font-medium',
  'bg-terracotta-500 text-white shadow-organic-sm transition-all duration-200 ease-out',
  'hover:bg-terracotta-600 hover:shadow-organic-md active:bg-terracotta-700 focus-ring select-none',
)

function DashboardPage() {
  const { data: user } = useCurrentUserQuery()
  const today = useMemo(
    () => getCalendarDateInTimezone(user?.timezone ?? getDefaultTimezone()),
    [user?.timezone],
  )
  const { trackers, isLoading } = useTrackersWithDays(today)

  const totalCount = trackers.reduce(
    (sum, entry) => sum + entry.tracker.daysCount,
    0,
  )
  const hasTrackers = !isLoading && trackers.length > 0

  return (
    <div className="relative min-h-[calc(100dvh-4.5rem)] overflow-hidden bg-earth-50 px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-36 h-96 w-96 rounded-full border-[56px] border-sage-100/60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-terracotta-100/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
              Your space
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-earth-900 sm:text-5xl">
              TheDays
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-earth-600">
              Every completed day counts, forever. Missed days never reset what
              you have already built.
              {hasTrackers ? (
                <span className="ml-1 font-semibold text-earth-700">
                  {totalCount.toLocaleString()}{' '}
                  {totalCount === 1 ? 'day' : 'days'} across{' '}
                  {trackers.length === 1
                    ? '1 tracker'
                    : `${trackers.length} trackers`}
                  .
                </span>
              ) : null}
            </p>
          </div>

          <Link
            to={ROUTES.trackers.new}
            className={cn(primaryLinkClasses, 'shrink-0')}
          >
            <PlusIcon />
            Create a tracker
          </Link>
        </header>

        {user ? (
          <div className="mt-6 max-w-xl">
            <TimezoneMismatchBanner user={user} />
          </div>
        ) : null}

        <main className="mt-10">
          {isLoading ? (
            <TrackersGridSkeleton count={6} />
          ) : hasTrackers ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {trackers.map((entry, index) => (
                <TrackerCard
                  key={entry.tracker.id}
                  entry={entry}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </main>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="animate-fade-in-up relative mx-auto mt-4 max-w-lg overflow-hidden rounded-3xl border border-dashed border-earth-300 bg-white/70 p-12 text-center shadow-inner">
      <p className="mx-auto grid size-16 place-items-center rounded-full bg-terracotta-100 font-display text-2xl font-semibold text-terracotta-600">
        0
      </p>
      <h2 className="mt-6 font-display text-2xl font-semibold text-earth-900">
        No trackers yet.
      </h2>
      <p className="mx-auto mt-2 max-w-sm leading-7 text-earth-600">
        Create the first one to begin counting the days you show up — running,
        reading, or any habit worth celebrating.
      </p>
      <Link to={ROUTES.trackers.new} className={cn(primaryLinkClasses, 'mt-6')}>
        <PlusIcon />
        Create your first tracker
      </Link>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
