import { getCompletionStreaks } from '../streaks'
import type { Tracker } from '@/types/trackers'
import { formatDateString } from '@/lib/utils/dates'

interface StreaksPanelProps {
  tracker: Tracker
  completedDates: ReadonlySet<string>
  today: string
}

export function StreaksPanel({
  tracker,
  completedDates,
  today,
}: StreaksPanelProps) {
  const { currentStreak, streaks } = getCompletionStreaks({
    completedDates,
    completionMode: tracker.completionMode,
    startDate: tracker.startDate,
    today,
  })
  const historicalStreaks = [...streaks].reverse()

  return (
    <section
      aria-label="Streaks"
      className="animate-fade-in-up relative overflow-hidden rounded-3xl border border-earth-100 bg-white p-6 shadow-organic-sm sm:p-7"
    >
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-20 size-44 rounded-full bg-sand-200/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-sand-500 via-terracotta-400 to-sage-500"
      />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-earth-400">
              Streaks inside this tracker
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-earth-900">
              Consecutive completed days
            </h2>
          </div>
          <div className="rounded-2xl border border-sand-300 bg-sand-100 px-4 py-3 text-right shadow-inner">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sand-800">
              Current
            </p>
            <p className="font-display text-3xl font-semibold text-earth-900 tabular-nums">
              {currentStreak?.dayCount ?? 0}
              <span className="ml-1 text-sm font-medium text-earth-500">
                {currentStreak?.dayCount === 1 ? 'day' : 'days'}
              </span>
            </p>
          </div>
        </div>

        {currentStreak ? (
          <p className="mt-4 max-w-xl text-sm leading-6 text-earth-600">
            Current run: {formatDateString(currentStreak.startDate, 'medium')}{' '}
            through {formatDateString(currentStreak.endDate, 'medium')}.
          </p>
        ) : (
          <p className="mt-4 max-w-xl text-sm leading-6 text-earth-600">
            No active streak right now. Your completed days still count toward
            this tracker.
          </p>
        )}

        <div className="mt-6 border-t border-dashed border-earth-200 pt-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-lg font-semibold text-earth-900">
              Streak history
            </h3>
            {historicalStreaks.length > 0 ? (
              <span className="rounded-full bg-earth-100 px-2.5 py-1 text-xs font-semibold text-earth-600">
                {historicalStreaks.length.toLocaleString()}{' '}
                {historicalStreaks.length === 1 ? 'run' : 'runs'}
              </span>
            ) : null}
          </div>

          {historicalStreaks.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-earth-300 bg-earth-50/70 px-4 py-5 text-sm leading-6 text-earth-500">
              No streaks of 2+ days yet. Keep checking days when they happen;
              gaps do not erase your progress.
            </div>
          ) : (
            <ol className="mt-4 space-y-2">
              {historicalStreaks.map((streak) => (
                <li
                  key={`${streak.startDate}-${streak.endDate}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-earth-100 bg-earth-50/70 px-4 py-3"
                >
                  <p className="min-w-0 text-sm font-medium text-earth-800">
                    <time dateTime={streak.startDate}>
                      {formatDateString(streak.startDate, 'medium')}
                    </time>{' '}
                    to{' '}
                    <time dateTime={streak.endDate}>
                      {formatDateString(streak.endDate, 'medium')}
                    </time>
                  </p>
                  <p className="shrink-0 rounded-full bg-sage-100 px-3 py-1 text-sm font-semibold text-sage-800 tabular-nums">
                    {streak.dayCount.toLocaleString()}{' '}
                    {streak.dayCount === 1 ? 'day' : 'days'}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  )
}
