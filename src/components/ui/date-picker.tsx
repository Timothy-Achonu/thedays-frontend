import { useEffect, useId, useRef, useState } from 'react'
import { Calendar } from './calendar'
import type { ReactNode } from 'react'
import { formatDateString } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

interface DatePickerProps {
  label: string
  /** Selected date as `YYYY-MM-DD`, or undefined for no selection. */
  value?: string
  onChange: (date: string) => void
  /** "Today" in the user's profile timezone. */
  today: string
  /** Dates after this `YYYY-MM-DD` value are disabled. */
  disabledAfter?: string
  error?: string
  hint?: string
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({
  label,
  value,
  onChange,
  today,
  disabledAfter,
  error,
  hint,
  placeholder = 'Choose a date',
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const generatedId = useId()
  const errorId = `${generatedId}-error`
  const hintId = `${generatedId}-hint`
  const hasError = Boolean(error)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [open])

  const closePanel = (returnFocus = true) => {
    setOpen(false)
    if (returnFocus) {
      triggerRef.current?.focus()
    }
  }

  return (
    <div className="w-full">
      <label
        htmlFor={generatedId}
        className={cn(
          'mb-1.5 block text-sm font-medium',
          hasError ? 'text-error-600' : 'text-earth-700',
          disabled && 'text-earth-400',
        )}
      >
        {label}
        <span className="ml-0.5 text-terracotta-500">*</span>
      </label>

      <div ref={containerRef} className="relative">
        <button
          ref={triggerRef}
          id={generatedId}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : hint ? hintId : undefined}
          disabled={disabled}
          onClick={() => setOpen((previous) => !previous)}
          onKeyDown={(event) => {
            if (!open && ['ArrowDown', 'Enter', ' '].includes(event.key)) {
              event.preventDefault()
              setOpen(true)
            }
          }}
          className={cn(
            'flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-base font-body',
            'transition-all duration-200 ease-out',
            'focus-ring',
            hasError
              ? 'border-error-500 focus:border-error-500'
              : 'border-earth-200 hover:border-earth-300 focus:border-terracotta-400',
            disabled && 'cursor-not-allowed bg-earth-100 text-earth-500',
          )}
        >
          <span className={value ? 'text-earth-900' : 'text-earth-400'}>
            {value ? formatDateString(value, 'long') : placeholder}
          </span>
          <CalendarIcon
            className={cn(
              'size-5 shrink-0',
              hasError ? 'text-error-500' : 'text-earth-400',
            )}
          />
        </button>

        {open ? (
          <div
            role="dialog"
            aria-label={`${label} calendar`}
            className={cn(
              'absolute left-0 top-[calc(100%+0.5rem)] z-40 w-[min(21rem,92vw)]',
              'animate-scale-in rounded-2xl border border-earth-100 shadow-xl',
            )}
          >
            <Calendar
              value={value}
              onSelect={(date) => {
                onChange(date)
                closePanel()
              }}
              today={today}
              disabledAfter={disabledAfter}
              className="shadow-none"
            />
            <div className="flex justify-end border-t border-earth-100 px-3 py-2">
              <button
                type="button"
                onClick={() => closePanel()}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-earth-600 transition-colors hover:bg-earth-100 hover:text-earth-800 focus-ring"
              >
                Done
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {hasError ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 flex items-center gap-1 text-sm text-error-600"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-sm text-earth-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function CalendarIcon({ className }: { className?: string }): ReactNode {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="5"
        width="17"
        height="16"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3.5 9.5h17M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="8.5" cy="14" r="1.25" fill="currentColor" />
      <circle cx="12" cy="14" r="1.25" fill="currentColor" />
    </svg>
  )
}
