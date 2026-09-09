import { useState } from 'react'
import { useIsMutating } from '@tanstack/react-query'
import { isPerfectClosedMonth } from '../streaks'
import { resolveDayState } from '../../trackers/daily-status'
import type { DayState } from '../../trackers/daily-status'
import type { Tracker } from '@/types/trackers'
import {
  COMPLETED_DAY_MUTATION_KEY,
  useMarkCompletedDayMutation,
  useUnmarkCompletedDayMutation,
} from '@/lib/app/trackers'
import {
  addDaysToDate,
  formatDayListLabel,
  inclusiveDayCount,
  latestDayWindow,
} from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

const INITIAL_BATCH = 30
const LOAD_MORE_STEP = 60

interface MonthGroup {
  key: string
  label: string
  startIndex: number
  dates: Array<string>
}

interface YearGroup {
  year: string
  months: Array<MonthGroup>
}

const monthNameFormatter = new Intl.DateTimeFormat(undefined, {
  timeZone: 'UTC',
  month: 'long',
})

interface DayListProps {
  tracker: Tracker
  completedDates: ReadonlySet<string>
  today: string
  onError: (message: string) => void
}

/**
 * Reverse-chronological day history generated client-side from startDate
 * through today. Rendered in batches so long histories never mount thousands
 * of rows at once (PRD §59).
 */
export function DayList({
  tracker,
  completedDates,
  today,
  onError,
}: DayListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH)
  const markMutation = useMarkCompletedDayMutation()
  const unmarkMutation = useUnmarkCompletedDayMutation()
  const isCompletionPending =
    useIsMutating({ mutationKey: COMPLETED_DAY_MUTATION_KEY }) > 0

  const totalDays = inclusiveDayCount(tracker.startDate, today)

  if (totalDays === 0) {
    return null
  }

  const visibleDays = latestDayWindow(tracker.startDate, today, visibleCount)
  const yearGroups = groupDaysByCalendar(visibleDays)
  const remainingCount = totalDays - visibleDays.length

  const toggle = (date: string, isCompleted: boolean) => {
    const mutation = isCompleted ? unmarkMutation : markMutation
    mutation.mutate(
      { trackerId: tracker.id, date },
      {
        onError: () =>
          onError('The change could not be saved. Please try again.'),
      },
    )
  }

  return (
    <section aria-label="Day history">
      <div className="space-y-12">
        {yearGroups.map((yearGroup) => (
          <section
            key={yearGroup.year}
            aria-labelledby={`day-history-year-${yearGroup.year}`}
          >
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-gradient-to-r from-transparent to-earth-300"
              />
              <h3
                id={`day-history-year-${yearGroup.year}`}
                className="font-display text-2xl font-semibold tracking-[0.08em] text-earth-700"
              >
                <time dateTime={yearGroup.year}>{yearGroup.year}</time>
              </h3>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-gradient-to-l from-transparent to-earth-300"
              />
            </div>

            <div className="mt-7 space-y-9">
              {yearGroup.months.map((month) => {
                const isPerfectMonth = isPerfectClosedMonth({
                  completedDates,
                  completionMode: tracker.completionMode,
                  monthKey: month.key,
                  startDate: tracker.startDate,
                  today,
                })

                return (
                  <section
                    key={month.key}
                    aria-labelledby={`day-history-month-${month.key}`}
                  >
                    <header className="mb-4 flex items-end gap-4">
                      <h4
                        id={`day-history-month-${month.key}`}
                        className={cn(
                          'inline-flex min-w-0 items-center gap-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl',
                          isPerfectMonth ? 'text-sand-800' : 'text-earth-900',
                        )}
                      >
                        {isPerfectMonth ? <GoldStarIcon /> : null}
                        <time dateTime={month.key}>{month.label}</time>
                      </h4>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'mb-2 h-px flex-1',
                          isPerfectMonth
                            ? 'bg-gradient-to-r from-sand-500 to-transparent'
                            : 'bg-earth-200',
                        )}
                      />
                      {isPerfectMonth ? (
                        <span className="mb-1 hidden rounded-full border border-sand-400 bg-sand-100 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sand-800 sm:inline-flex">
                          Perfect month
                        </span>
                      ) : null}
                    </header>

                    <ol className="space-y-1.5">
                      {month.dates.map((date, index) => (
                        <DayRow
                          key={date}
                          date={date}
                          tracker={tracker}
                          completedDates={completedDates}
                          today={today}
                          onToggle={toggle}
                          index={month.startIndex + index}
                          isBusy={isCompletionPending}
                        />
                      ))}
                    </ol>
                  </section>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {remainingCount > 0 ? (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + LOAD_MORE_STEP)}
            className="rounded-xl border border-earth-300 bg-white px-5 py-2.5 text-sm font-semibold text-earth-700 shadow-xs transition-all hover:border-earth-400 hover:bg-earth-50 focus-ring"
          >
            Load earlier days ({remainingCount.toLocaleString()} more)
          </button>
        </div>
      ) : null}

      <p className="mt-4 text-center text-xs text-earth-400">
        Showing the latest {visibleDays.length.toLocaleString()} of{' '}
        {totalDays.toLocaleString()} days since {tracker.startDate}.
      </p>
    </section>
  )
}

function groupDaysByCalendar(days: Array<string>): Array<YearGroup> {
  const groups: Array<YearGroup> = []

  days.forEach((date, index) => {
    const year = date.slice(0, 4)
    const monthKey = date.slice(0, 7)
    let yearGroup = groups.at(-1)

    if (!yearGroup || yearGroup.year !== year) {
      yearGroup = { year, months: [] }
      groups.push(yearGroup)
    }

    let monthGroup = yearGroup.months.at(-1)

    if (!monthGroup || monthGroup.key !== monthKey) {
      monthGroup = {
        key: monthKey,
        label: monthNameFormatter.format(
          new Date(`${monthKey}-01T00:00:00Z`),
        ),
        startIndex: index,
        dates: [],
      }
      yearGroup.months.push(monthGroup)
    }

    monthGroup.dates.push(date)
  })

  return groups
}

function DayRow({
  date,
  tracker,
  completedDates,
  today,
  onToggle,
  index,
  isBusy,
}: Omit<DayListProps, 'onError'> & {
  date: string
  onToggle: (date: string, isCompleted: boolean) => void
  index: number
  isBusy: boolean
}) {
  const isCompleted = completedDates.has(date)
  const state: DayState = resolveDayState(
    tracker.completionMode,
    today,
    date,
    isCompleted,
  )
  const relativeLabel =
    date === today
      ? 'Today'
      : date === addDaysToDate(today, -1)
        ? 'Yesterday'
        : null
  const rowDelay = Math.min(index, 14) * 30

  return (
    <li
      className="animate-fade-in-up"
      style={{
        animationDelay: `${rowDelay}ms`,
        animationFillMode: 'backwards',
      }}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={isCompleted}
        disabled={state === 'unavailable' || isBusy}
        onClick={() => onToggle(date, isCompleted)}
        aria-label={
          state === 'unavailable'
            ? `${formatDayListLabel(date, today)} is unavailable until the day ends`
            : `${isCompleted ? 'Unmark' : 'Mark'} ${formatDayListLabel(date, today)} as completed`
        }
        className={cn(
          'group flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-all duration-200',
          'focus-ring',
          state === 'completed' &&
            'border-sage-200 bg-sage-50/70 hover:bg-sage-100/70',
          state === 'completable' &&
            'border-earth-100 bg-white hover:border-sage-300 hover:bg-sage-50/40',
          state === 'unavailable' &&
            'border-dashed border-earth-200 bg-earth-50/60',
          state !== 'unavailable' && !isBusy && 'cursor-pointer',
          state === 'unavailable' && 'cursor-not-allowed',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors duration-150',
            state === 'completed' && 'border-sage-500 bg-sage-500 text-white',
            state === 'completable' &&
              'border-earth-300 bg-white group-hover:border-sage-400',
            state === 'unavailable' && 'border-earth-300/70 bg-transparent',
            isBusy && state !== 'unavailable' && 'animate-pulse-soft',
          )}
        >
          {state === 'completed' ? <CheckMark /> : null}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate text-sm font-medium',
              state === 'unavailable' ? 'text-earth-400' : 'text-earth-800',
              state === 'completed' && 'text-sage-900',
            )}
          >
            {formatDayListLabel(date, today)}
          </span>
          {state === 'unavailable' ? (
            <span className="mt-0.5 block text-xs italic text-earth-400">
              Available after the day ends
            </span>
          ) : null}
        </span>

        {relativeLabel ? (
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest',
              relativeLabel === 'Today'
                ? 'bg-terracotta-100 text-terracotta-700'
                : 'bg-earth-100 text-earth-500',
            )}
          >
            {relativeLabel}
          </span>
        ) : null}
      </button>
    </li>
  )
}

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="m6 12.5 4 4 8-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GoldStarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="size-7 shrink-0 text-warning-500 drop-shadow-sm sm:size-8"
      aria-label="Perfect month"
      role="img"
    >
      <path
        d="m12 3.25 2.64 5.35 5.91.86-4.28 4.17 1.01 5.89L12 16.74l-5.28 2.78 1.01-5.89-4.28-4.17 5.91-.86L12 3.25Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="round"
      />
    </svg>
  )
}
