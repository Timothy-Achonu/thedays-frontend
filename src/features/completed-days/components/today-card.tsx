import { useState } from 'react'
import { useIsMutating } from '@tanstack/react-query'
import { getPrimaryDay } from '../../trackers/daily-status'
import { BadDayChangeDialog, DayStatusActions } from './day-status-actions'
import type { BadDayChange } from './day-status-actions'
import type { Tracker } from '@/types/trackers'
import {
  COMPLETED_DAY_MUTATION_KEY,
  useMarkBadDayMutation,
  useMarkCompletedDayMutation,
  useUnmarkBadDayMutation,
  useUnmarkCompletedDayMutation,
} from '@/lib/app/trackers'
import { formatDateString } from '@/lib/utils/dates'

interface TodayCardProps {
  tracker: Tracker
  completedDates: ReadonlySet<string>
  badDates: ReadonlySet<string>
  today: string
  onError: (message: string) => void
}

/** The prominent daily action for Practice and Abstinence trackers. */
export function TodayCard({
  tracker,
  completedDates,
  badDates,
  today,
  onError,
}: TodayCardProps) {
  const markMutation = useMarkCompletedDayMutation()
  const unmarkMutation = useUnmarkCompletedDayMutation()
  const markBadMutation = useMarkBadDayMutation()
  const unmarkBadMutation = useUnmarkBadDayMutation()
  const [badDayChange, setBadDayChange] = useState<BadDayChange | null>(null)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const isCompletionPending =
    useIsMutating({ mutationKey: COMPLETED_DAY_MUTATION_KEY }) > 0

  const primaryDay = getPrimaryDay(tracker, today)
  const isBusy =
    markMutation.isPending ||
    unmarkMutation.isPending ||
    markBadMutation.isPending ||
    unmarkBadMutation.isPending ||
    isCompletionPending

  const saveError = () =>
    onError('The change could not be saved. Please try again.')

  const toggleGood = (date: string, isGood: boolean, isBad: boolean) => {
    if (isBad) {
      setDialogError(null)
      setBadDayChange({ date, action: 'mark-good' })
      return
    }

    const mutation = isGood ? unmarkMutation : markMutation
    mutation.mutate({ trackerId: tracker.id, date }, { onError: saveError })
  }

  const toggleBad = (date: string, isBad: boolean) => {
    if (isBad) {
      setDialogError(null)
      setBadDayChange({ date, action: 'unmark-bad' })
      return
    }

    markBadMutation.mutate(
      { trackerId: tracker.id, date },
      { onError: saveError },
    )
  }

  const confirmBadDayChange = () => {
    if (!badDayChange) return
    setDialogError(null)

    const options = {
      onSuccess: () => setBadDayChange(null),
      onError: () =>
        setDialogError('The change could not be saved. Please try again.'),
    }

    if (badDayChange.action === 'mark-good') {
      markMutation.mutate(
        {
          trackerId: tracker.id,
          date: badDayChange.date,
          replaceBad: true,
        },
        options,
      )
      return
    }

    unmarkBadMutation.mutate(
      { trackerId: tracker.id, date: badDayChange.date },
      options,
    )
  }

  if (tracker.completionMode === 'abstinence') {
    const todayIsBad = badDates.has(today)

    return (
      <>
        <section className="animate-fade-in-up relative overflow-hidden rounded-3xl border border-earth-100 bg-white p-7 shadow-organic-md">
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-terracotta-500 via-error-400 to-sand-400" />

          <div className="pl-2">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta-600">
                  Today
                </p>
                <p className="mt-1.5 font-display text-2xl font-semibold text-earth-900">
                  {formatDateString(today, 'full')}
                </p>
                <p aria-live="polite" className="mt-1 text-sm text-earth-500">
                  {todayIsBad
                    ? 'Marked bad. You can still return it to in progress.'
                    : 'In progress. Record a failure now so it is not forgotten.'}
                </p>
              </div>

              <DayStatusActions
                date={today}
                isGood={false}
                isBad={todayIsBad}
                canMarkGood={false}
                isBusy={isBusy}
                variant="card"
                onGood={() => undefined}
                onBad={() => toggleBad(today, todayIsBad)}
              />
            </div>

            <p className="mt-3 text-xs text-earth-400">
              A good day becomes available after midnight in your account
              timezone.
            </p>

            {primaryDay ? (
              <div className="mt-5 flex flex-col gap-4 border-t border-dashed border-earth-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-400">
                    {primaryDay.relativeLabel}
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-earth-900">
                    {formatDateString(primaryDay.date, 'full')}
                  </p>
                </div>
                <DayStatusActions
                  date={primaryDay.date}
                  isGood={completedDates.has(primaryDay.date)}
                  isBad={badDates.has(primaryDay.date)}
                  canMarkGood
                  isBusy={isBusy}
                  onGood={() =>
                    toggleGood(
                      primaryDay.date,
                      completedDates.has(primaryDay.date),
                      badDates.has(primaryDay.date),
                    )
                  }
                  onBad={() =>
                    toggleBad(primaryDay.date, badDates.has(primaryDay.date))
                  }
                />
              </div>
            ) : (
              <p className="mt-5 border-t border-dashed border-earth-200 pt-4 text-sm text-earth-500">
                This tracker started today, so there is no finished day to mark
                good yet.
              </p>
            )}
          </div>
        </section>

        <BadDayChangeDialog
          change={badDayChange}
          isPending={markMutation.isPending || unmarkBadMutation.isPending}
          error={dialogError}
          onConfirm={confirmBadDayChange}
          onClose={() => setBadDayChange(null)}
        />
      </>
    )
  }

  if (!primaryDay) return null

  const primaryCompleted = completedDates.has(primaryDay.date)

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
          disabled={isBusy}
          onClick={() => toggleGood(primaryDay.date, primaryCompleted, false)}
          aria-label={`${primaryCompleted ? 'Unmark' : 'Mark'} ${formatDateString(primaryDay.date, 'long')} as completed`}
          className={[
            'group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl px-6 py-3.5 text-lg font-semibold',
            'transition-all duration-200 ease-out focus-ring select-none',
            primaryCompleted
              ? 'bg-sage-100 text-sage-800 ring-1 ring-inset ring-sage-300 hover:bg-sage-50 active:bg-sage-100'
              : 'bg-sage-600 text-white shadow-organic-md hover:bg-sage-700 active:bg-sage-800',
            isBusy ? 'cursor-wait opacity-80' : '',
          ].join(' ')}
        >
          {primaryCompleted ? <CheckIcon /> : <CircleIcon />}
          {isBusy ? (
            <span>Saving…</span>
          ) : primaryCompleted ? (
            <span>Completed</span>
          ) : (
            <span>Mark as completed</span>
          )}
        </button>
      </div>
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
