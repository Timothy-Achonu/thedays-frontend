import { useState } from 'react'
import { useIsMutating } from '@tanstack/react-query'
import type { Tracker } from '@/types/trackers'
import { AppDialog, Button } from '@/components/ui'
import {
  COMPLETED_DAY_MUTATION_KEY,
  useCheckAllCompletedDaysMutation,
  useClearAllCompletedDaysMutation,
} from '@/lib/app/trackers'
import {
  addDaysToDate,
  formatDateString,
  inclusiveDayCount,
} from '@/lib/utils/dates'
import { parseApiError } from '@/lib/utils'

type BulkAction = 'check' | 'uncheck' | null

interface BulkDayActionsProps {
  tracker: Tracker
  completedDates: ReadonlySet<string>
  today: string
}

export function BulkDayActions({
  tracker,
  completedDates,
  today,
}: BulkDayActionsProps) {
  const [action, setAction] = useState<BulkAction>(null)
  const [actionCount, setActionCount] = useState(0)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const checkAllMutation = useCheckAllCompletedDaysMutation()
  const clearAllMutation = useClearAllCompletedDaysMutation()
  const pendingCompletionMutations = useIsMutating({
    mutationKey: COMPLETED_DAY_MUTATION_KEY,
  })

  const { lastEligibleBoundary, eligibleTotal, completedEligibleCount } =
    getEligibleProgress(tracker, completedDates, today)
  const uncheckedEligibleCount = eligibleTotal - completedEligibleCount
  const completedCount = completedDates.size
  const isCheckPending = checkAllMutation.isPending
  const isClearPending = clearAllMutation.isPending
  const isAnyCompletionPending = pendingCompletionMutations > 0
  const firstEligibleDate = eligibleTotal > 0 ? tracker.startDate : undefined
  const lastEligibleDate = eligibleTotal > 0 ? lastEligibleBoundary : undefined

  const openAction = (nextAction: Exclude<BulkAction, null>) => {
    setDialogError(null)
    setFeedback(null)
    setActionCount(
      nextAction === 'check' ? uncheckedEligibleCount : completedCount,
    )
    setAction(nextAction)
  }

  const closeDialog = () => {
    if (isCheckPending || isClearPending) return
    setDialogError(null)
    setAction(null)
  }

  const confirmCheckAll = () => {
    setDialogError(null)
    checkAllMutation.mutate(tracker.id, {
      onSuccess: ({ added, total }) => {
        setFeedback(
          added === 0
            ? `All ${total.toLocaleString()} eligible days are already checked. Review Day history and uncheck any missed days.`
            : `${formatDayCount(added)} checked. ${formatDayCount(total)} completed in total. Review Day history and uncheck any missed days.`,
        )
        setAction(null)
      },
      onError: (error) => setDialogError(getBulkActionError(error, 'check')),
    })
  }

  const confirmClearAll = () => {
    setDialogError(null)
    clearAllMutation.mutate(tracker.id, {
      onSuccess: ({ cleared }) => {
        setFeedback(
          cleared === 0
            ? 'There were no completed days to uncheck.'
            : `${formatDayCount(cleared)} unchecked.`,
        )
        setAction(null)
      },
      onError: (error) => setDialogError(getBulkActionError(error, 'uncheck')),
    })
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-earth-200 bg-white px-4 py-4 shadow-organic-sm sm:px-5">
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-12 size-32 rounded-full bg-sage-100/70 blur-2xl"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-sage-500 shadow-[0_0_0_4px_rgba(168,195,176,0.25)]"
              />
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-500">
                Historical backfill
              </p>
            </div>
            <p className="mt-2 font-display text-lg font-semibold text-earth-900">
              {eligibleTotal === 0
                ? 'No finished days available yet'
                : `${completedEligibleCount.toLocaleString()} of ${eligibleTotal.toLocaleString()} eligible days completed`}
            </p>
            <p className="mt-1 max-w-lg text-sm leading-5 text-earth-500">
              Save time when most days qualify: mark them all, then uncheck any
              missed days below.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CheckAllIcon />}
              className="w-full sm:w-auto"
              disabled={uncheckedEligibleCount === 0 || isAnyCompletionPending}
              onClick={() => openAction('check')}
            >
              Mark all eligible dates
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<UncheckAllIcon />}
              className="w-full text-error-600 hover:bg-error-50 hover:text-error-700 sm:w-auto"
              disabled={completedCount === 0 || isAnyCompletionPending}
              onClick={() => openAction('uncheck')}
            >
              Clear completion history
            </Button>
          </div>
        </div>

        {feedback ? (
          <p
            role="status"
            aria-live="polite"
            className="relative mt-4 border-t border-earth-100 pt-3 text-sm font-medium text-sage-700"
          >
            {feedback}
          </p>
        ) : null}
      </div>

      <AppDialog
        open={action === 'check'}
        onClose={closeDialog}
        title={`Mark ${formatDayCount(actionCount)} as completed?`}
        description="This marks every currently unchecked eligible date as completed."
        size="sm"
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              variant="ghost"
              onClick={closeDialog}
              disabled={isCheckPending}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={confirmCheckAll}
              isLoading={isCheckPending}
            >
              {isCheckPending
                ? 'Checking days…'
                : `Check ${formatDayCount(actionCount)}`}
            </Button>
          </div>
        }
      >
        {firstEligibleDate && lastEligibleDate ? (
          <div className="rounded-xl border border-sage-200 bg-sage-50 px-4 py-3">
            <p className="text-sm font-semibold text-sage-900">
              Historical backfill range
            </p>
            <p className="mt-1 text-sm text-sage-700">
              {formatDateString(firstEligibleDate, 'medium')} through{' '}
              {formatDateString(lastEligibleDate, 'medium')}
            </p>
          </div>
        ) : null}

        <p className="mt-3 text-sm leading-6 text-earth-600">
          Afterward, review Day history and uncheck any days you missed. Your
          completion total and landmark progress will update as you make
          changes.
        </p>

        {tracker.completionMode === 'abstinence' ? (
          <p className="mt-3 rounded-xl border border-sand-300 bg-sand-100 px-4 py-3 text-sm leading-5 text-sand-900">
            Today stays unchecked because an Abstinence day only becomes
            available after it ends.
          </p>
        ) : null}

        <DialogError message={dialogError} />
      </AppDialog>

      <AppDialog
        open={action === 'uncheck'}
        onClose={closeDialog}
        title={`Clear all ${formatDayCount(actionCount)}?`}
        description="Every completion in this tracker will be permanently removed, including dates not currently loaded below."
        size="sm"
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              variant="ghost"
              onClick={closeDialog}
              disabled={isClearPending}
            >
              Keep checked
            </Button>
            <Button
              variant="danger"
              onClick={confirmClearAll}
              isLoading={isClearPending}
            >
              {isClearPending
                ? 'Unchecking days…'
                : `Uncheck ${formatDayCount(actionCount)}`}
            </Button>
          </div>
        }
      >
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm leading-6 text-error-700">
          Your tracker and landmarks will remain, but completion totals and
          landmark progress will be recalculated from zero.
        </div>

        <p className="mt-3 text-sm leading-6 text-earth-600">
          You can check individual days again later.
        </p>

        <DialogError message={dialogError} />
      </AppDialog>
    </>
  )
}

export function getEligibleProgress(
  tracker: Pick<Tracker, 'completionMode' | 'startDate'>,
  completedDates: ReadonlySet<string>,
  today: string,
) {
  const lastEligibleBoundary =
    tracker.completionMode === 'practice' ? today : addDaysToDate(today, -1)
  const eligibleTotal = inclusiveDayCount(
    tracker.startDate,
    lastEligibleBoundary,
  )
  let completedEligibleCount = 0
  completedDates.forEach((date) => {
    if (date >= tracker.startDate && date <= lastEligibleBoundary) {
      completedEligibleCount += 1
    }
  })
  return { lastEligibleBoundary, eligibleTotal, completedEligibleCount }
}

function DialogError({ message }: { message: string | null }) {
  return message ? (
    <p
      role="alert"
      className="mt-3 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700"
    >
      {message}
    </p>
  ) : null
}

function getBulkActionError(
  error: unknown,
  action: Exclude<BulkAction, null>,
): string {
  const parsed = parseApiError(error)

  if (parsed.code === 'BACKFILL_RANGE_TOO_LARGE') {
    return 'This tracker spans more than five years, so all of its days cannot be checked at once. You can still mark days individually.'
  }

  if (parsed.code !== 'UNKNOWN_ERROR') return parsed.message

  return action === 'check'
    ? 'The days could not be checked. Please try again.'
    : 'The days could not be unchecked. Please try again.'
}

function formatDayCount(count: number): string {
  return `${count.toLocaleString()} ${count === 1 ? 'day' : 'days'}`
}

function CheckAllIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="m4.5 12.5 3 3 5-6M11.5 15.5l2 2 6-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UncheckAllIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <rect
        x="4.5"
        y="4.5"
        width="15"
        height="15"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 12h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
