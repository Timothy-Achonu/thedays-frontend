import { useState } from 'react'
import { useIsMutating } from '@tanstack/react-query'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
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
  badDates: ReadonlySet<string>
  today: string
}

export function BulkDayActions({
  tracker,
  completedDates,
  badDates,
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

  const {
    lastEligibleBoundary,
    eligibleTotal,
    completedEligibleCount,
    badEligibleCount,
  } = getEligibleProgress(tracker, completedDates, badDates, today)
  const uncheckedEligibleCount =
    eligibleTotal - completedEligibleCount - badEligibleCount
  const completedCount = completedDates.size
  const isAbstinence = tracker.completionMode === 'abstinence'
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

  const preservedEntryCopy = (preservedCount: number) => {
    if (preservedCount === 0) return ''
    if (isAbstinence) {
      return ` ${formatDayCount(preservedCount)} recorded as ${preservedCount === 1 ? 'a setback was' : 'setbacks were'} preserved.`
    }
    return ` ${formatDayCount(preservedCount)} marked bad ${preservedCount === 1 ? 'was' : 'were'} preserved.`
  }

  const confirmCheckAll = () => {
    setDialogError(null)
    checkAllMutation.mutate(tracker.id, {
      onSuccess: ({ added, total, preservedBad }) => {
        const preservedCopy = preservedEntryCopy(preservedBad)
        setFeedback(
          isAbstinence
            ? added === 0
              ? `There were no unreviewed days to mark on track.${preservedCopy}`
              : `${formatDayCount(added)} marked on track. ${formatDayCount(total)} count toward TheDays.${preservedCopy}`
            : added === 0
              ? `There were no unreviewed eligible days to mark good.${preservedCopy}`
              : `${formatDayCount(added)} marked good. ${formatDayCount(total)} completed in total.${preservedCopy}`,
        )
        setAction(null)
      },
      onError: (error) => setDialogError(getBulkActionError(error, 'check')),
    })
  }

  const confirmClearAll = () => {
    setDialogError(null)
    clearAllMutation.mutate(tracker.id, {
      onSuccess: ({ cleared, preservedBad }) => {
        const preservedCopy = preservedEntryCopy(preservedBad)
        setFeedback(
          isAbstinence
            ? cleared === 0
              ? `There were no on-track entries to clear.${preservedCopy}`
              : `${formatDayCount(cleared)} cleared.${preservedCopy}`
            : cleared === 0
              ? `There were no completed days to uncheck.${preservedCopy}`
              : `${formatDayCount(cleared)} unchecked.${preservedCopy}`,
        )
        setAction(null)
      },
      onError: (error) => setDialogError(getBulkActionError(error, 'uncheck')),
    })
  }

  return (
    <>
      {isAbstinence ? (
        <AbstinenceHistoryMenu
          canCheck={uncheckedEligibleCount > 0 && !isAnyCompletionPending}
          canClear={completedCount > 0 && !isAnyCompletionPending}
          onCheck={() => openAction('check')}
          onClear={() => openAction('uncheck')}
        />
      ) : (
        <PracticeBulkPanel
          eligibleTotal={eligibleTotal}
          completedEligibleCount={completedEligibleCount}
          canCheck={uncheckedEligibleCount > 0 && !isAnyCompletionPending}
          canClear={completedCount > 0 && !isAnyCompletionPending}
          onCheck={() => openAction('check')}
          onClear={() => openAction('uncheck')}
          feedback={feedback}
        />
      )}

      {isAbstinence && feedback ? (
        <p
          role="status"
          aria-live="polite"
          className="mt-3 text-sm font-medium text-sage-700"
        >
          {feedback}
        </p>
      ) : null}

      <AppDialog
        open={action === 'check'}
        onClose={closeDialog}
        title={
          isAbstinence
            ? `Mark ${formatDayCount(actionCount)} on track?`
            : `Mark ${formatDayCount(actionCount)} as completed?`
        }
        description={
          isAbstinence
            ? 'This updates every eligible unreviewed date. Existing setback entries remain unchanged.'
            : 'This marks every unreviewed eligible date as good and preserves dates already marked bad.'
        }
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
                ? 'Saving days…'
                : isAbstinence
                  ? `Mark ${formatDayCount(actionCount)}`
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
          {isAbstinence
            ? 'Your total and landmark progress update only for newly on-track days. Existing setback entries are never overwritten.'
            : 'Your completion total and landmark progress update only for the new good days. Existing bad records are never overwritten by this action.'}
        </p>

        {isAbstinence ? (
          <p className="mt-3 rounded-xl border border-sand-300 bg-sand-100 px-4 py-3 text-sm leading-5 text-sand-900">
            Today stays in progress. It can only be marked on track after the
            calendar day ends.
          </p>
        ) : null}

        <DialogError message={dialogError} />
      </AppDialog>

      <AppDialog
        open={action === 'uncheck'}
        onClose={closeDialog}
        title={`Clear all ${formatDayCount(actionCount)}?`}
        description={
          isAbstinence
            ? 'Every on-track entry will be removed, including dates not currently loaded. Setback entries remain recorded.'
            : 'Every good completion in this tracker will be removed, including dates not currently loaded below. Bad dates remain recorded.'
        }
        size="sm"
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              variant="ghost"
              onClick={closeDialog}
              disabled={isClearPending}
            >
              {isAbstinence ? 'Keep entries' : 'Keep checked'}
            </Button>
            <Button
              variant="danger"
              onClick={confirmClearAll}
              isLoading={isClearPending}
            >
              {isClearPending
                ? isAbstinence
                  ? 'Clearing days…'
                  : 'Unchecking days…'
                : isAbstinence
                  ? `Clear ${formatDayCount(actionCount)}`
                  : `Uncheck ${formatDayCount(actionCount)}`}
            </Button>
          </div>
        }
      >
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm leading-6 text-error-700">
          {isAbstinence
            ? 'Your tracker, landmarks, and setback history remain, but totals and landmark progress will be recalculated from zero.'
            : 'Your tracker, landmarks, and bad-day history remain, but completion totals and landmark progress will be recalculated from zero.'}
        </div>

        <p className="mt-3 text-sm leading-6 text-earth-600">
          {isAbstinence
            ? 'You can review individual days again later.'
            : 'You can check individual days again later.'}
        </p>

        <DialogError message={dialogError} />
      </AppDialog>
    </>
  )
}

function AbstinenceHistoryMenu({
  canCheck,
  canClear,
  onCheck,
  onClear,
}: {
  canCheck: boolean
  canClear: boolean
  onCheck: () => void
  onClear: () => void
}) {
  return (
    <Menu as="div" className="relative">
      <MenuButton className="inline-flex items-center gap-2 rounded-xl border border-earth-200 bg-white/75 px-3 py-2 text-sm font-semibold text-earth-600 shadow-xs transition-colors hover:border-earth-300 hover:bg-white focus-ring">
        <DotsIcon />
        History tools
      </MenuButton>
      <MenuItems
        transition
        className="absolute right-0 top-full z-40 mt-2 w-64 origin-top-right rounded-2xl border border-earth-200 bg-white p-1.5 shadow-organic-lg outline-none transition duration-150 data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <MenuItem>
          <button
            type="button"
            disabled={!canCheck}
            onClick={onCheck}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-earth-700 transition-colors hover:bg-earth-50 focus:bg-earth-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckAllIcon />
            Mark unreviewed days on track
          </button>
        </MenuItem>
        <MenuItem>
          <button
            type="button"
            disabled={!canClear}
            onClick={onClear}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-earth-700 transition-colors hover:bg-earth-50 focus:bg-earth-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            <UncheckAllIcon />
            Clear on-track entries
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  )
}

function PracticeBulkPanel({
  eligibleTotal,
  completedEligibleCount,
  canCheck,
  canClear,
  onCheck,
  onClear,
  feedback,
}: {
  eligibleTotal: number
  completedEligibleCount: number
  canCheck: boolean
  canClear: boolean
  onCheck: () => void
  onClear: () => void
  feedback: string | null
}) {
  return (
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
            Mark every unreviewed eligible day good at once. Dates already
            marked bad stay untouched.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<CheckAllIcon />}
            className="w-full sm:w-auto"
            disabled={!canCheck}
            onClick={onCheck}
          >
            Mark all eligible dates
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<UncheckAllIcon />}
            className="w-full text-error-600 hover:bg-error-50 hover:text-error-700 sm:w-auto"
            disabled={!canClear}
            onClick={onClear}
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
  )
}

export function getEligibleProgress(
  tracker: Pick<Tracker, 'completionMode' | 'startDate'>,
  completedDates: ReadonlySet<string>,
  badDates: ReadonlySet<string>,
  today: string,
) {
  const lastEligibleBoundary =
    tracker.completionMode === 'practice' ? today : addDaysToDate(today, -1)
  const eligibleTotal = inclusiveDayCount(
    tracker.startDate,
    lastEligibleBoundary,
  )
  let completedEligibleCount = 0
  let badEligibleCount = 0
  completedDates.forEach((date) => {
    if (date >= tracker.startDate && date <= lastEligibleBoundary) {
      completedEligibleCount += 1
    }
  })
  badDates.forEach((date) => {
    if (date >= tracker.startDate && date <= lastEligibleBoundary) {
      badEligibleCount += 1
    }
  })
  return {
    lastEligibleBoundary,
    eligibleTotal,
    completedEligibleCount,
    badEligibleCount,
  }
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

function DotsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-4"
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  )
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
