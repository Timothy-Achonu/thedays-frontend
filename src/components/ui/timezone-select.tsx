import { useId, useMemo, useState } from 'react'
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react'
import { cn } from '@/lib/utils/cn'
import {
  formatTimezoneLabel,
  getSupportedTimezones,
} from '@/lib/utils/timezone'

interface TimezoneSelectProps {
  value: string
  onChange: (timezone: string) => void
  label?: string
  error?: string
  hint?: string
  id?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

function normalizeSearchTokens(value: string): Array<string> {
  return value
    .toLocaleLowerCase()
    .split(/[\s/_]+/)
    .filter(Boolean)
}

function matchesTimezone(timezone: string, query: string): boolean {
  const queryTokens = normalizeSearchTokens(query)
  if (queryTokens.length === 0) return true

  const timezoneTokens = normalizeSearchTokens(timezone)
  let timezoneTokenIndex = 0

  return queryTokens.every((queryToken) => {
    const matchingIndex = timezoneTokens.findIndex(
      (timezoneToken, index) =>
        index >= timezoneTokenIndex && timezoneToken.startsWith(queryToken),
    )

    if (matchingIndex === -1) return false
    timezoneTokenIndex = matchingIndex + 1
    return true
  })
}

export function TimezoneSelect({
  label = 'Timezone',
  error,
  hint,
  value,
  onChange,
  id,
  disabled,
  required,
  className,
}: TimezoneSelectProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`
  const [query, setQuery] = useState('')
  const timezones = useMemo(() => getSupportedTimezones([value]), [value])
  const filteredTimezones = useMemo(
    () => timezones.filter((timezone) => matchesTimezone(timezone, query)),
    [query, timezones],
  )
  const timezoneGroups = useMemo(() => {
    const groups = new Map<string, Array<string>>()

    for (const timezone of filteredTimezones) {
      const [region = 'Other'] = timezone.split('/')
      const group = timezone === 'UTC' ? 'Universal' : region
      groups.set(group, [...(groups.get(group) ?? []), timezone])
    }

    return Array.from(groups.entries())
  }, [filteredTimezones])
  const hasError = Boolean(error)

  return (
    <div className={cn('w-full', className)}>
      <label
        htmlFor={inputId}
        className={cn(
          'mb-1.5 block text-sm font-medium',
          hasError ? 'text-error-600' : 'text-earth-700',
          disabled && 'text-earth-400',
        )}
      >
        {label}
        {required && <span className="ml-0.5 text-terracotta-500">*</span>}
      </label>

      <Combobox
        as="div"
        value={value}
        onChange={(timezone) => {
          if (timezone) onChange(timezone)
        }}
        onClose={() => setQuery('')}
        disabled={disabled}
        immediate
      >
        <div className="relative">
          <ComboboxInput
            id={inputId}
            required={required}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : hint ? hintId : undefined}
            displayValue={(timezone: string) => formatTimezoneLabel(timezone)}
            onChange={(event) => setQuery(event.target.value)}
            className={cn(
              'w-full rounded-xl border bg-white px-4 py-3 pr-11 font-body text-base',
              'transition-all duration-200 ease-out focus-ring',
              hasError
                ? 'border-error-500 text-error-900 focus:border-error-500'
                : 'border-earth-200 text-earth-900 hover:border-earth-300 focus:border-terracotta-400',
              disabled &&
                'cursor-not-allowed border-earth-200 bg-earth-100 text-earth-500',
            )}
          />
          <ComboboxButton
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-earth-400 focus-ring disabled:cursor-not-allowed"
            aria-label="Show timezone options"
          >
            <ChevronDownIcon className="h-5 w-5" />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          className={cn(
            'mt-1.5 max-h-56 w-full overflow-y-auto overscroll-contain rounded-xl border border-earth-200 bg-white py-1 shadow-lg',
            'focus:outline-none empty:hidden',
          )}
        >
          {filteredTimezones.length === 0 ? (
            <div className="px-4 py-3 text-sm text-earth-500">
              No timezones found.
            </div>
          ) : (
            timezoneGroups.map(([group, groupTimezones]) => (
              <div key={group}>
                <div className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-earth-500">
                  {formatTimezoneLabel(group)}
                </div>
                {groupTimezones.map((timezone) => (
                  <ComboboxOption
                    key={timezone}
                    value={timezone}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-3 px-4 py-2 text-sm text-earth-800 outline-none',
                      'data-focus:bg-earth-100 data-selected:font-medium data-selected:text-terracotta-700',
                    )}
                  >
                    {({ selected }) => (
                      <>
                        <span>{formatTimezoneLabel(timezone)}</span>
                        {selected ? (
                          <CheckIcon className="h-4 w-4 shrink-0 text-terracotta-600" />
                        ) : null}
                      </>
                    )}
                  </ComboboxOption>
                ))}
              </div>
            ))
          )}
        </ComboboxOptions>
      </Combobox>

      {hasError ? (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-error-600">
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

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m4 10 4 4 8-8" />
    </svg>
  )
}
