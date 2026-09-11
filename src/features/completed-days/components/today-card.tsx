import { useIsMutating } from '@tanstack/react-query'
import { getPrimaryDay } from '../../trackers/daily-status'
import {
  AbstinenceDayMarker,
  useAbstinenceDayEditor,
} from './day-status-actions'
import type { DayState } from '../../trackers/daily-status'
import type { Tracker } from '@/types/trackers'
import {
  COMPLETED_DAY_MUTATION_KEY,
  useMarkCompletedDayMutation,
  useUnmarkCompletedDayMutation,
} from '@/lib/app/trackers'
import { formatDateString } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

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
  const abstinenceEditor = useAbstinenceDayEditor(tracker.id)
  const isCompletionPending =
    useIsMutating({ mutationKey: COMPLETED_DAY_MUTATION_KEY }) > 0

  const primaryDay = getPrimaryDay(tracker, today)
  const isBusy =
    markMutation.isPending || unmarkMutation.isPending || isCompletionPending

  const saveError = () =>
    onError('The change could not be saved. Please try again.')

  const toggleGood = (date: string, isGood: boolean) => {
    const mutation = isGood ? unmarkMutation : markMutation
    mutation.mutate({ trackerId: tracker.id, date }, { onError: saveError })
  }

  if (tracker.completionMode === 'abstinence') {
    const todayIsBad = badDates.has(today)
    const primaryIsOnTrack = primaryDay
      ? completedDates.has(primaryDay.date)
      : false
    const primaryIsSetback = primaryDay ? badDates.has(primaryDay.date) : false

    return (
      <>
        <section className="animate-fade-in-up relative overflow-hidden rounded-3xl border border-earth-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,248,245,0.96))] p-6 shadow-organic-sm sm:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,transparent_0,transparent_43px,rgba(212,196,175,0.18)_44px)]" />
          <div className="relative">
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-earth-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-earth-400">
                  Daily notes
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-earth-900">
                  A quiet check-in
                </h2>
              </div>
              <span className="font-display text-sm italic text-earth-400">
                One day at a time
              </span>
            </div>

            <div className="space-y-2">
              <AbstinenceNoteRow
                date={today}
                label="Today"
                summary={todayIsBad ? 'Entry saved' : 'In progress'}
                state={todayIsBad ? 'bad' : 'unavailable'}
                disabled={isBusy}
                onOpen={() =>
                  abstinenceEditor.openDay({
                    date: today,
                    isOnTrack: false,
                    isSetback: todayIsBad,
                    canMarkOnTrack: false,
                  })
                }
              />

              {primaryDay ? (
                <AbstinenceNoteRow
                  date={primaryDay.date}
                  label={primaryDay.relativeLabel}
                  summary={
                    primaryIsOnTrack || primaryIsSetback
                      ? 'Reviewed'
                      : 'Ready to review'
                  }
                  state={
                    primaryIsOnTrack
                      ? 'completed'
                      : primaryIsSetback
                        ? 'bad'
                        : 'completable'
                  }
                  disabled={isBusy}
                  onOpen={() =>
                    abstinenceEditor.openDay({
                      date: primaryDay.date,
                      isOnTrack: primaryIsOnTrack,
                      isSetback: primaryIsSetback,
                      canMarkOnTrack: true,
                    })
                  }
                />
              ) : (
                <p className="rounded-2xl border border-dashed border-earth-300 bg-white/60 px-4 py-3 text-sm text-earth-500">
                  Your first review opens after this day ends.
                </p>
              )}
            </div>
          </div>
        </section>
        {abstinenceEditor.editor}
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
          onClick={() => toggleGood(primaryDay.date, primaryCompleted)}
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

function AbstinenceNoteRow({
  date,
  label,
  summary,
  state,
  disabled,
  onOpen,
}: {
  date: string
  label: string
  summary: string
  state: DayState
  disabled: boolean
  onOpen: () => void
}) {
  const preciseState =
    state === 'completed'
      ? 'on track'
      : state === 'bad'
        ? 'setback recorded'
        : state === 'unavailable'
          ? 'in progress'
          : 'unreviewed'

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onOpen}
      aria-label={`Open ${formatDateString(date, 'long')} entry, ${preciseState}`}
      className={cn(
        'group flex w-full items-center gap-4 rounded-2xl border border-transparent bg-white/75 px-4 py-3 text-left transition-all focus-ring',
        'hover:border-earth-200 hover:bg-white hover:shadow-xs',
        disabled && 'cursor-wait opacity-60',
      )}
    >
      <AbstinenceDayMarker state={state} />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-earth-400">
          {label}
        </span>
        <span className="mt-0.5 block truncate font-display text-lg font-semibold text-earth-900">
          {formatDateString(date, 'full')}
        </span>
      </span>
      <span className="shrink-0 text-sm font-medium text-earth-500">
        {summary}
      </span>
      <ChevronRightIcon />
    </button>
  )
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="size-4 shrink-0 text-earth-400 transition-transform group-hover:translate-x-0.5"
      aria-hidden="true"
    >
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
