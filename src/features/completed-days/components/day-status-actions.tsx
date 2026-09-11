import { useState } from 'react'
import { useIsMutating } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { DayState } from '../../trackers/daily-status'
import { AppDialog, Button } from '@/components/ui'
import {
  COMPLETED_DAY_MUTATION_KEY,
  useMarkBadDayMutation,
  useMarkCompletedDayMutation,
  useUnmarkBadDayMutation,
  useUnmarkCompletedDayMutation,
} from '@/lib/app/trackers'
import { formatDateString } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

interface AbstinenceDaySelection {
  date: string
  isOnTrack: boolean
  isSetback: boolean
  canMarkOnTrack: boolean
}

type Confirmation = 'replace-setback' | 'clear-setback' | null

export function useAbstinenceDayEditor(trackerId: string) {
  const [selection, setSelection] = useState<AbstinenceDaySelection | null>(
    null,
  )
  const [confirmation, setConfirmation] = useState<Confirmation>(null)
  const [error, setError] = useState<string | null>(null)
  const markCompletedMutation = useMarkCompletedDayMutation()
  const unmarkCompletedMutation = useUnmarkCompletedDayMutation()
  const markSetbackMutation = useMarkBadDayMutation()
  const clearSetbackMutation = useUnmarkBadDayMutation()
  const isBusy = useIsMutating({ mutationKey: COMPLETED_DAY_MUTATION_KEY }) > 0

  const openDay = (nextSelection: AbstinenceDaySelection) => {
    setError(null)
    setConfirmation(null)
    setSelection(nextSelection)
  }

  const close = () => {
    if (isBusy) return
    setSelection(null)
    setConfirmation(null)
    setError(null)
  }

  const mutationOptions = {
    onSuccess: close,
    onError: () => setError('The entry could not be saved. Please try again.'),
  }

  const markOnTrack = () => {
    if (!selection || !selection.canMarkOnTrack || selection.isOnTrack) return
    setError(null)

    if (selection.isSetback) {
      setConfirmation('replace-setback')
      return
    }

    markCompletedMutation.mutate(
      { trackerId, date: selection.date },
      mutationOptions,
    )
  }

  const markSetback = () => {
    if (!selection || selection.isSetback) return
    setError(null)
    markSetbackMutation.mutate(
      { trackerId, date: selection.date },
      mutationOptions,
    )
  }

  const clearEntry = () => {
    if (!selection || (!selection.isOnTrack && !selection.isSetback)) return
    setError(null)

    if (selection.isSetback) {
      setConfirmation('clear-setback')
      return
    }

    unmarkCompletedMutation.mutate(
      { trackerId, date: selection.date },
      mutationOptions,
    )
  }

  const confirmChange = () => {
    if (!selection || !confirmation) return
    setError(null)

    if (confirmation === 'replace-setback') {
      markCompletedMutation.mutate(
        { trackerId, date: selection.date, replaceBad: true },
        mutationOptions,
      )
      return
    }

    clearSetbackMutation.mutate(
      { trackerId, date: selection.date },
      mutationOptions,
    )
  }

  return {
    isBusy,
    openDay,
    editor: (
      <AbstinenceDayEditor
        selection={selection}
        confirmation={confirmation}
        isBusy={isBusy}
        error={error}
        onMarkOnTrack={markOnTrack}
        onMarkSetback={markSetback}
        onClear={clearEntry}
        onConfirm={confirmChange}
        onCancelConfirmation={() => setConfirmation(null)}
        onClose={close}
      />
    ),
  }
}

function AbstinenceDayEditor({
  selection,
  confirmation,
  isBusy,
  error,
  onMarkOnTrack,
  onMarkSetback,
  onClear,
  onConfirm,
  onCancelConfirmation,
  onClose,
}: {
  selection: AbstinenceDaySelection | null
  confirmation: Confirmation
  isBusy: boolean
  error: string | null
  onMarkOnTrack: () => void
  onMarkSetback: () => void
  onClear: () => void
  onConfirm: () => void
  onCancelConfirmation: () => void
  onClose: () => void
}) {
  const replacingSetback = confirmation === 'replace-setback'

  return (
    <AppDialog
      open={selection !== null}
      onClose={onClose}
      title={
        confirmation
          ? replacingSetback
            ? 'Change this entry?'
            : 'Clear this entry?'
          : selection
            ? formatDateString(selection.date, 'full')
            : 'Day entry'
      }
      description={
        confirmation
          ? 'This day is currently recorded as a setback.'
          : 'A private note for this day. Choose the outcome that is accurate.'
      }
      size="sm"
      footer={
        confirmation ? (
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              variant="ghost"
              onClick={onCancelConfirmation}
              disabled={isBusy}
            >
              Keep setback
            </Button>
            <Button
              variant={replacingSetback ? 'secondary' : 'danger'}
              onClick={onConfirm}
              isLoading={isBusy}
            >
              {replacingSetback ? 'Change to on track' : 'Clear entry'}
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button variant="ghost" onClick={onClose} disabled={isBusy}>
              Close
            </Button>
          </div>
        )
      }
    >
      {confirmation ? (
        <div className="rounded-2xl border border-earth-200 bg-earth-50 px-4 py-4 text-sm leading-6 text-earth-700">
          {replacingSetback
            ? 'The setback entry will be replaced and this date will add one to your TheDays total.'
            : 'The date will return to unreviewed. It will not be marked on track.'}
        </div>
      ) : selection ? (
        <div className="space-y-4">
          <div className="grid gap-3">
            <OutcomeButton
              title="On track"
              description={
                selection.canMarkOnTrack
                  ? 'This day adds one to your TheDays total.'
                  : 'Available after this calendar day ends.'
              }
              selected={selection.isOnTrack}
              disabled={!selection.canMarkOnTrack || isBusy}
              tone="sage"
              marker={<OnTrackMark />}
              onClick={onMarkOnTrack}
            />
            <OutcomeButton
              title="Setback"
              description="Record the day without undoing progress from earlier days."
              selected={selection.isSetback}
              disabled={isBusy}
              tone="clay"
              marker={<SetbackMark />}
              onClick={onMarkSetback}
            />
          </div>

          {selection.isOnTrack || selection.isSetback ? (
            <button
              type="button"
              onClick={onClear}
              disabled={isBusy}
              className="w-full rounded-xl px-3 py-2 text-sm font-medium text-earth-500 transition-colors hover:bg-earth-100 hover:text-earth-800 focus-ring disabled:cursor-wait disabled:opacity-50"
            >
              Clear entry
            </button>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700"
        >
          {error}
        </p>
      ) : null}
    </AppDialog>
  )
}

function OutcomeButton({
  title,
  description,
  selected,
  disabled,
  tone,
  marker,
  onClick,
}: {
  title: string
  description: string
  selected: boolean
  disabled: boolean
  tone: 'sage' | 'clay'
  marker: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all focus-ring',
        selected && tone === 'sage' && 'border-sage-300 bg-sage-50',
        selected && tone === 'clay' && 'border-terracotta-300 bg-sand-100',
        !selected &&
          'border-earth-200 bg-white hover:border-earth-300 hover:bg-earth-50',
        disabled && 'cursor-not-allowed opacity-45',
      )}
    >
      <span
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-full',
          tone === 'sage'
            ? 'bg-sage-100 text-sage-700'
            : 'bg-sand-200 text-terracotta-700',
        )}
      >
        {marker}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-lg font-semibold text-earth-900">
          {title}
        </span>
        <span className="mt-0.5 block text-sm leading-5 text-earth-500">
          {description}
        </span>
      </span>
      {selected ? (
        <span className="ml-auto text-xs font-bold uppercase tracking-[0.14em] text-earth-500">
          Selected
        </span>
      ) : null}
    </button>
  )
}

export function AbstinenceDayMarker({ state }: { state: DayState }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-full border bg-white',
        state === 'completed' && 'border-sage-300 bg-sage-50 text-sage-700',
        state === 'bad' && 'border-sand-400 bg-sand-100 text-terracotta-700',
        state === 'completable' && 'border-earth-300 text-earth-400',
        state === 'unavailable' && 'border-sand-300 bg-sand-50 text-sand-700',
      )}
    >
      {state === 'completed' ? <OnTrackMark /> : null}
      {state === 'bad' ? <SetbackMark /> : null}
      {state === 'completable' ? (
        <span className="size-1.5 rounded-full bg-earth-300" />
      ) : null}
      {state === 'unavailable' ? (
        <span className="h-px w-3 bg-current" />
      ) : null}
    </span>
  )
}

function OnTrackMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path
        d="m7 12.5 3.2 3.2L17 8.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SetbackMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path
        d="M12 7.5v9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
