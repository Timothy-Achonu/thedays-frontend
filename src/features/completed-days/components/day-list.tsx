import { useMemo, useState } from 'react'
import { useIsMutating } from '@tanstack/react-query'
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
  enumerateDays,
  formatDayListLabel,
} from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

const INITIAL_BATCH = 30
const LOAD_MORE_STEP = 60

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

  const allDays = useMemo(
    () => enumerateDays(tracker.startDate, today).reverse(),
    [tracker.startDate, today],
  )

  if (allDays.length === 0) {
    return null
  }

  const visibleDays = allDays.slice(0, visibleCount)
  const remainingCount = allDays.length - visibleDays.length

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
      <ol className="space-y-1.5">
        {visibleDays.map((date, index) => (
          <DayRow
            key={date}
            date={date}
            tracker={tracker}
            completedDates={completedDates}
            today={today}
            onToggle={toggle}
            index={index}
            isBusy={isCompletionPending}
          />
        ))}
      </ol>

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
        {allDays.length.toLocaleString()} days since {tracker.startDate}.
      </p>
    </section>
  )
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
        aria-label={`Mark ${formatDayListLabel(date, today)} as completed`}
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
