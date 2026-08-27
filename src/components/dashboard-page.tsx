import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { TimezoneMismatchBanner } from '@/components/timezone-mismatch-banner'
import { useCurrentUserQuery } from '@/lib/app/auth'
import { useDashboardSummaryQuery } from '@/lib/app/dashboard'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'

const primaryLinkClasses = cn(
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold',
  'bg-terracotta-500 text-white shadow-organic-sm transition-all duration-200 ease-out',
  'hover:-translate-y-0.5 hover:bg-terracotta-600 hover:shadow-organic-md active:translate-y-0 active:bg-terracotta-700 focus-ring select-none',
)

export function DashboardPage() {
  const { data: user } = useCurrentUserQuery()
  const summaryQuery = useDashboardSummaryQuery()
  const stats = summaryQuery.data?.stats

  return (
    <div className="relative min-h-[calc(100dvh-4.5rem)] overflow-hidden bg-earth-50 px-5 py-9 sm:px-8 lg:px-12 lg:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-48 size-[34rem] rounded-full border-[72px] border-sage-100/65"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -left-36 size-[30rem] rounded-full bg-terracotta-100/45 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <header className="grid gap-7 border-b border-earth-200/80 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta-600">
              Your progress ledger
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-earth-950 sm:text-5xl lg:text-6xl">
              Hi {user?.username ?? 'there'}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-earth-600 sm:text-lg">
              A clear view of every day you have counted and what is waiting
              just ahead.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={ROUTES.trackers.index}
              className="inline-flex items-center justify-center rounded-xl border border-earth-300 bg-white/80 px-4 py-2.5 text-sm font-semibold text-earth-800 shadow-xs transition-colors hover:bg-earth-100 focus-ring"
            >
              View trackers
            </Link>
            <Link to={ROUTES.trackers.new} className={primaryLinkClasses}>
              <PlusIcon />
              Create tracker
            </Link>
          </div>
        </header>

        {user ? (
          <div className="mt-6 max-w-2xl">
            <TimezoneMismatchBanner user={user} />
          </div>
        ) : null}

        <main className="mt-8">
          {summaryQuery.isError && summaryQuery.data ? (
            <WarningBanner onRetry={() => void summaryQuery.refetch()} />
          ) : null}
          {summaryQuery.isLoading ? (
            <DashboardSkeleton />
          ) : summaryQuery.isError && !summaryQuery.data ? (
            <BlockingError onRetry={() => void summaryQuery.refetch()} />
          ) : stats ? (
            <section
              aria-label="Dashboard statistics"
              className="grid gap-5 md:grid-cols-2 xl:grid-cols-12"
            >
              <MetricCard
                className="md:col-span-1 xl:col-span-3"
                eyebrow="Trackers"
              >
                <p className="font-display text-6xl font-semibold tracking-tight text-earth-950">
                  {stats.trackerCount.toLocaleString()}
                </p>
                <p className="mt-3 text-sm leading-6 text-earth-500">
                  {stats.trackerCount === 1
                    ? 'One journey in motion.'
                    : 'Journeys you are counting.'}
                </p>
              </MetricCard>

              <MetricCard
                className="overflow-hidden bg-earth-950 text-earth-50 md:col-span-1 xl:col-span-5"
                eyebrow="Total completed days"
              >
                <div
                  aria-hidden="true"
                  className="absolute -right-10 -top-14 size-48 rounded-full border-[28px] border-terracotta-500/20"
                />
                <p className="relative font-display text-7xl font-semibold tracking-[-0.05em] text-terracotta-300 sm:text-8xl">
                  {stats.totalCompletedDays.toLocaleString()}
                </p>
                <p className="relative mt-3 max-w-sm text-sm leading-6 text-earth-300">
                  Every completion stays part of the story. A missed day never
                  erases this total.
                </p>
              </MetricCard>

              <MetricCard
                className="md:col-span-1 xl:col-span-4"
                eyebrow="Highest tracker"
              >
                {stats.highestTracker ? (
                  <Link
                    to={ROUTES.trackers.detail(stats.highestTracker.id)}
                    className="group block rounded-xl focus-ring"
                  >
                    <p className="font-display text-3xl font-semibold leading-tight text-earth-950 transition-colors group-hover:text-terracotta-700">
                      {stats.highestTracker.title}
                    </p>
                    <p className="mt-4 flex items-baseline gap-2">
                      <span className="font-display text-5xl font-semibold text-terracotta-600">
                        {stats.highestTracker.daysCount.toLocaleString()}
                      </span>
                      <span className="text-sm font-semibold text-earth-500">
                        completed days
                      </span>
                    </p>
                    {stats.highestTracker.tiedWithCount > 0 ? (
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-sage-700">
                        Tied with {stats.highestTracker.tiedWithCount}{' '}
                        {stats.highestTracker.tiedWithCount === 1
                          ? 'other tracker'
                          : 'other trackers'}
                      </p>
                    ) : null}
                  </Link>
                ) : (
                  <NeutralMetric
                    title="No progress yet"
                    description="Complete the first day on any tracker to set the pace."
                  />
                )}
              </MetricCard>

              <MetricCard
                className="md:col-span-2 xl:col-span-12"
                eyebrow="Closest landmark"
              >
                {stats.closestLandmark ? (
                  <Link
                    to={ROUTES.trackers.detail(
                      stats.closestLandmark.tracker.id,
                    )}
                    className="group grid gap-6 rounded-xl focus-ring md:grid-cols-[1fr_auto] md:items-end"
                  >
                    <div>
                      <p className="text-sm font-semibold text-sage-700">
                        {stats.closestLandmark.tracker.title}
                      </p>
                      <h2 className="mt-1 font-display text-3xl font-semibold text-earth-950 transition-colors group-hover:text-terracotta-700">
                        {stats.closestLandmark.title ??
                          `${stats.closestLandmark.targetCount}-day landmark`}
                      </h2>
                      <div
                        className="mt-5 h-2.5 overflow-hidden rounded-full bg-earth-100"
                        aria-hidden="true"
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sage-500 to-terracotta-500"
                          style={{
                            width: `${landmarkProgress(
                              stats.closestLandmark.currentCount,
                              stats.closestLandmark.targetCount,
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="mt-2 text-sm text-earth-500">
                        {stats.closestLandmark.currentCount.toLocaleString()} of{' '}
                        {stats.closestLandmark.targetCount.toLocaleString()}{' '}
                        days
                        {stats.closestLandmark.tiedWithCount > 0
                          ? ` · ${stats.closestLandmark.tiedWithCount} equally close`
                          : ''}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-sage-100 px-6 py-5 text-center ring-1 ring-inset ring-sage-200">
                      <p className="font-display text-4xl font-semibold text-sage-800">
                        {stats.closestLandmark.remaining.toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-sage-700">
                        {stats.closestLandmark.remaining === 1
                          ? 'day to go'
                          : 'days to go'}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <NeutralMetric
                    title="No upcoming landmark"
                    description="Add a future target to a tracker and it will appear here."
                  />
                )}
              </MetricCard>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  )
}

function MetricCard({
  eyebrow,
  children,
  className,
}: {
  eyebrow: string
  children: ReactNode
  className?: string
}) {
  return (
    <article
      className={cn(
        'animate-fade-in-up relative rounded-3xl border border-earth-200/80 bg-white/85 p-6 shadow-organic-sm backdrop-blur sm:p-7',
        className,
      )}
    >
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-earth-400">
        {eyebrow}
      </p>
      {children}
    </article>
  )
}

function NeutralMetric({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-earth-300 bg-earth-50/80 p-5">
      <p className="font-display text-2xl font-semibold text-earth-800">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-earth-500">{description}</p>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading dashboard statistics"
      className="grid gap-5 md:grid-cols-2 xl:grid-cols-12"
    >
      <div className="h-64 animate-pulse-soft rounded-3xl border border-earth-100 bg-white shadow-organic-sm md:col-span-1 xl:col-span-3" />
      <div className="h-64 animate-pulse-soft rounded-3xl border border-earth-100 bg-earth-950 shadow-organic-sm md:col-span-1 xl:col-span-5" />
      <div className="h-64 animate-pulse-soft rounded-3xl border border-earth-100 bg-white shadow-organic-sm md:col-span-1 xl:col-span-4" />
      <div className="h-64 animate-pulse-soft rounded-3xl border border-earth-100 bg-white shadow-organic-sm md:col-span-2 xl:col-span-12" />
    </div>
  )
}

function WarningBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="status"
      className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sand-300 bg-sand-100 px-4 py-3 text-sm text-sand-900"
    >
      <span>
        Dashboard updates could not be refreshed. Showing the last saved view.
      </span>
      <button
        type="button"
        onClick={onRetry}
        className="font-semibold underline underline-offset-4 focus-ring"
      >
        Retry
      </button>
    </div>
  )
}

function BlockingError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-3xl border border-error-200 bg-error-50 p-10 text-center">
      <h2 className="font-display text-2xl font-semibold text-earth-900">
        Your dashboard could not be loaded.
      </h2>
      <p className="mt-2 text-earth-600">
        Your progress is safe. Try the request again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-xl bg-earth-900 px-4 py-2.5 font-semibold text-white focus-ring"
      >
        Try again
      </button>
    </div>
  )
}

function landmarkProgress(currentCount: number, targetCount: number): number {
  return Math.min(100, Math.max(0, (currentCount / targetCount) * 100))
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
