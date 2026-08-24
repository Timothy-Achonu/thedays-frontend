import { getPrimaryDay } from '../../trackers/daily-status'
import type { Tracker } from '@/types/trackers'
import {
  useMarkCompletedDayMutation,
  useUnmarkCompletedDayMutation,
} from '@/lib/app/trackers'
import { formatDateString } from '@/lib/utils/dates'

interface TodayCardProps {
  tracker: Tracker
  completedDates: ReadonlySet<string>
  today: string
  onError: (message: string) => void
}

/**
 * The primary daily control, per PRD §27: "Mark as completed" for today on a
 * Practice tracker; the latest finished day on an Abstinence tracker. Today is
 * shown as visible-but-locked while an Abstinence day is in progress.
 */
export function TodayCard({
  tracker,
  completedDates,
  today,
  onError,
}: TodayCardProps) {
  const markMutation = useMarkCompletedDayMutation()
  const unmarkMutation = useUnmarkCompletedDayMutation()

  const primaryDay = getPrimaryDay(tracker, today)
  const primaryCompleted = primaryDay
    ? completedDates.has(primaryDay.date)
    : false

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

  if (!primaryDay) {
    return (
      <section className="animate-fade-in-up relative overflow-hidden rounded-3xl border border-sand-300/70 bg-gradient-to-br from-sand-100 to-white p-7 shadow-organic-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sand-700">
          Day one in progress
        </p>
        <p className="mt-2 font-display text-xl font-semibold text-earth-900">
          Your first day becomes available after it ends.
        </p>
        <p className="mt-1 max-w-md leading-6 text-earth-600">
          Abstinence trackers only count whole finished days — come back
          tomorrow to mark your first.
        </p>
      </section>
    )
  }

  const isPrimaryToday = primaryDay.date === today

  return (
    <section className="animate-fade-in-up relative overflow-hidden rounded-3xl border border-earth-100 bg-white p-7 shadow-organic-md">
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-terracotta-400 via-sand-400 to-sage-500" />

      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5 pl-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-earth-400">
            {primaryDay.relativeLabel}
          </p>
          <p className="mt-1.5 font-display text-2xl font-semibold text-earth-900">
            {formatDateString(primaryDay.date, 'full')}
          </p>
          <p aria-live="polite" className="mt-1 text-sm text-earth-500">
            {primaryCompleted ? 'Marked complete.' : 'Not marked yet.'}
          </p>
        </div>

        <button
          type="button"
          role="checkbox"
          aria-checked={primaryCompleted}
          disabled={markMutation.isPending || unmarkMutation.isPending}
          onClick={() => toggle(primaryDay.date, primaryCompleted)}
          aria-label={`Mark ${formatDateString(primaryDay.date, 'long')} as completed`}
          className={[
            'group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl px-6 py-3.5 text-lg font-semibold',
            'transition-all duration-200 ease-out focus-ring select-none',
            primaryCompleted
              ? 'bg-sage-100 text-sage-800 ring-1 ring-inset ring-sage-300 hover:bg-sage-50 active:bg-sage-100'
              : 'bg-sage-600 text-white shadow-organic-md hover:bg-sage-700 active:bg-sage-800',
            markMutation.isPending || unmarkMutation.isPending
              ? 'cursor-wait opacity-80'
              : '',
          ].join(' ')}
        >
          {primaryCompleted ? <CheckIcon /> : <CircleIcon />}
          {markMutation.isPending || unmarkMutation.isPending ? (
            <span>Saving…</span>
          ) : primaryCompleted ? (
            <span>{isPrimaryToday ? 'Completed' : 'Marked'}</span>
          ) : (
            <span>Mark as completed</span>
          )}
        </button>
      </div>

      {!isPrimaryToday && !primaryCompleted ? (
        <p className="mt-4 border-t border-dashed border-earth-200 pt-3 text-sm text-earth-500">
          Today is still in progress and unlocks after midnight.
        </p>
      ) : null}
    </section>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="size-6 shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
      <path
        d="m7.5 12.5 3 3 6-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CircleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="size-6 shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 12h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
