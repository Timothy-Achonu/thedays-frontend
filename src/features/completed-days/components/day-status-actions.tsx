import { AppDialog, Button } from '@/components/ui'
import { formatDateString } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

export type BadDayChange = {
  date: string
  action: 'unmark-bad' | 'mark-good'
}

interface DayStatusActionsProps {
  date: string
  isGood: boolean
  isBad: boolean
  canMarkGood: boolean
  isBusy: boolean
  variant?: 'card' | 'row'
  onGood: () => void
  onBad: () => void
}

export function DayStatusActions({
  date,
  isGood,
  isBad,
  canMarkGood,
  isBusy,
  variant = 'row',
  onGood,
  onBad,
}: DayStatusActionsProps) {
  const isCard = variant === 'card'

  return (
    <div
      role="group"
      aria-label={`Status for ${formatDateString(date, 'long')}`}
      className={cn(
        'inline-flex items-stretch rounded-xl border border-earth-200 bg-earth-50/80 p-1',
        isCard && 'w-full max-w-sm rounded-2xl sm:w-auto',
      )}
    >
      <button
        type="button"
        aria-pressed={isGood}
        disabled={!canMarkGood || isBusy}
        onClick={onGood}
        aria-label={
          canMarkGood
            ? `${isGood ? 'Unmark' : 'Mark'} ${formatDateString(date, 'long')} as good`
            : `${formatDateString(date, 'long')} can be marked good after the day ends`
        }
        className={cn(
          'inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-all focus-ring sm:flex-none',
          isCard && 'min-h-12 rounded-xl px-5 text-base',
          isGood
            ? 'bg-sage-600 text-white shadow-sm'
            : 'text-sage-800 hover:bg-sage-100',
          (!canMarkGood || isBusy) && 'cursor-not-allowed opacity-45',
        )}
      >
        <CheckIcon />
        Good
      </button>
      <button
        type="button"
        aria-pressed={isBad}
        disabled={isBusy}
        onClick={onBad}
        aria-label={`${isBad ? 'Unmark' : 'Mark'} ${formatDateString(date, 'long')} as bad`}
        className={cn(
          'inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-all focus-ring sm:flex-none',
          isCard && 'min-h-12 rounded-xl px-5 text-base',
          isBad
            ? 'bg-error-600 text-white shadow-sm'
            : 'text-error-700 hover:bg-error-50',
          isBusy && 'cursor-wait opacity-60',
        )}
      >
        <CrossIcon />
        Bad
      </button>
    </div>
  )
}

interface BadDayChangeDialogProps {
  change: BadDayChange | null
  isPending: boolean
  error: string | null
  onConfirm: () => void
  onClose: () => void
}

export function BadDayChangeDialog({
  change,
  isPending,
  error,
  onConfirm,
  onClose,
}: BadDayChangeDialogProps) {
  const isMarkingGood = change?.action === 'mark-good'

  return (
    <AppDialog
      open={change !== null}
      onClose={() => {
        if (!isPending) onClose()
      }}
      title={
        isMarkingGood ? 'Change this day to good?' : 'Unmark this bad day?'
      }
      description={
        change
          ? `You already marked ${formatDateString(change.date, 'long')} as bad.`
          : undefined
      }
      size="sm"
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Keep as bad
          </Button>
          <Button
            variant={isMarkingGood ? 'secondary' : 'danger'}
            onClick={onConfirm}
            isLoading={isPending}
          >
            {isPending
              ? 'Saving…'
              : isMarkingGood
                ? 'Mark as good'
                : 'Unmark bad'}
          </Button>
        </div>
      }
    >
      <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm leading-6 text-error-700">
        {isMarkingGood
          ? 'This will replace the bad record, add one completed day, and may update landmark progress.'
          : 'This returns the date to not marked. It will not count as a good day.'}
      </div>
      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-error-200 bg-white px-4 py-3 text-sm text-error-700"
        >
          {error}
        </p>
      ) : null}
    </AppDialog>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="m6 12.5 4 4 8-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="m7 7 10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
