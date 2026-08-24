import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { CompletionMode } from '@/types/trackers'
import { Button, Input, Textarea } from '@/components/ui'
import { getFieldError, getFormError, parseApiError } from '@/lib/utils'
import { cn } from '@/lib/utils/cn'

export interface TrackerFormPayload {
  title: string
  /** `null` clears the description on edit; `undefined` means "not provided". */
  description: string | null | undefined
  startDate: string
  completionMode?: CompletionMode
}

interface TrackerFormProps {
  mode: 'create' | 'edit'
  today: string
  initialTitle?: string
  initialDescription?: string | null
  initialStartDate?: string
  currentCompletionMode?: CompletionMode
  submitLabel: string
  pendingLabel: string
  isPending: boolean
  onSubmit: (payload: TrackerFormPayload) => Promise<unknown>
  onCancel: () => void
}

const TITLE_MAX = 120
const DESCRIPTION_MAX = 500

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function TrackerForm({
  mode,
  today,
  initialTitle = '',
  initialDescription = '',
  initialStartDate = '',
  currentCompletionMode,
  submitLabel,
  pendingLabel,
  isPending,
  onSubmit,
  onCancel,
}: TrackerFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription ?? '')
  const [startDate, setStartDate] = useState(initialStartDate)
  const [completionMode, setCompletionMode] = useState<CompletionMode | null>(
    null,
  )
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string
    description?: string
    startDate?: string
    completionMode?: string
  }>({})
  const [formError, setFormError] = useState<string | null>(null)

  const validate = (): boolean => {
    const errors: typeof fieldErrors = {}
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      errors.title = 'Give your tracker a title.'
    } else if (trimmedTitle.length > TITLE_MAX) {
      errors.title = `Titles are limited to ${TITLE_MAX} characters.`
    }

    if (description.trim().length > DESCRIPTION_MAX) {
      errors.description = `Descriptions are limited to ${DESCRIPTION_MAX} characters.`
    }

    if (!DATE_PATTERN.test(startDate)) {
      errors.startDate = 'Choose a start date.'
    } else if (startDate > today) {
      errors.startDate = 'The start date cannot be in the future.'
    }

    if (mode === 'create' && !completionMode) {
      errors.completionMode =
        'Choose how this tracker counts days. There is no default.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    try {
      await onSubmit({
        title: title.trim(),
        description:
          description.trim() === '' && mode === 'edit'
            ? null
            : description.trim() || undefined,
        startDate,
        completionMode: mode === 'create' ? completionMode! : undefined,
      })
    } catch (error) {
      const parsed = parseApiError(error)

      setFieldErrors({
        title: getFieldError(parsed, 'title'),
        description: getFieldError(parsed, 'description'),
        startDate:
          getFieldError(parsed, 'startDate') ??
          describeDateErrorCode(parsed.code),
      })

      setFormError(
        parsed.formErrors[0] ||
          describeTrackerErrorCode(parsed.code) ||
          getFormError(parsed) ||
          null,
      )
    }
  }

  const isEditUnchanged =
    mode === 'edit' &&
    title.trim() === initialTitle &&
    startDate === initialStartDate &&
    (initialDescription ?? '') === description

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="space-y-5">
        <Input
          label="Title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={fieldErrors.title}
          placeholder="Days I Went Running"
          hint={`Up to ${TITLE_MAX} characters.`}
          maxLength={TITLE_MAX + 1}
          disabled={isPending}
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          error={fieldErrors.description}
          placeholder="Track every day on which a run is completed."
          hint={`Optional. Up to ${DESCRIPTION_MAX} characters.`}
          maxLength={DESCRIPTION_MAX + 1}
          disabled={isPending}
        />

        <div>
          <label
            htmlFor="tracker-start-date"
            className="mb-1.5 block text-sm font-medium text-earth-700"
          >
            Start date<span className="ml-0.5 text-terracotta-500">*</span>
          </label>
          <input
            id="tracker-start-date"
            type="date"
            required
            max={today}
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            aria-invalid={Boolean(fieldErrors.startDate)}
            disabled={isPending}
            className={cn(
              'w-full rounded-xl border bg-white px-4 py-3 text-base font-body text-earth-900',
              'transition-all duration-200 ease-out focus-ring',
              fieldErrors.startDate
                ? 'border-error-500'
                : 'border-earth-200 hover:border-earth-300 focus:border-terracotta-400',
              isPending &&
                'cursor-not-allowed border-earth-200 bg-earth-100 text-earth-500',
            )}
          />
          {fieldErrors.startDate ? (
            <p role="alert" className="mt-1.5 text-sm text-error-600">
              {fieldErrors.startDate}
            </p>
          ) : (
            <p className="mt-1.5 text-sm text-earth-500">
              Today or any day in the past, in your timezone ({today}).
            </p>
          )}
        </div>

        {mode === 'create' ? (
          <CompletionModeSelector
            value={completionMode}
            onChange={setCompletionMode}
            error={fieldErrors.completionMode}
            disabled={isPending}
          />
        ) : (
          <LockedCompletionMode mode={currentCompletionMode} />
        )}
      </div>

      {formError ? (
        <p
          role="alert"
          className="animate-shake rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm leading-6 text-error-700"
        >
          {formError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-earth-100 pt-5">
        <Button
          type="submit"
          isLoading={isPending}
          disabled={isPending || (mode === 'edit' && isEditUnchanged)}
        >
          {isPending ? pendingLabel : submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

function describeDateErrorCode(code: string): string | undefined {
  if (code === 'DATE_IN_FUTURE') {
    return 'The start date cannot be in the future.'
  }
  if (code === 'START_DATE_AFTER_COMPLETION') {
    return 'A completed day falls before that date. Choose an earlier start date.'
  }
  return undefined
}

function describeTrackerErrorCode(code: string): string | undefined {
  switch (code) {
    case 'TRACKER_NOT_FOUND':
      return 'This tracker no longer exists.'
    case 'VALIDATION_ERROR':
      return 'Please check your input and try again.'
    default:
      return undefined
  }
}

function CompletionModeSelector({
  value,
  onChange,
  error,
  disabled,
}: {
  value: CompletionMode | null
  onChange: (mode: CompletionMode) => void
  error?: string
  disabled?: boolean
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-earth-700">
        Completion mode
        <span className="ml-0.5 text-terracotta-500">*</span>
      </legend>
      <p className="mt-1 text-sm leading-6 text-earth-500">
        Decides when days can be marked. This choice is permanent.
      </p>

      <div
        className="mt-3 grid gap-3 sm:grid-cols-2"
        role="radiogroup"
        aria-label="Completion mode"
      >
        <CompletionModeOption
          id="completion-mode-practice"
          title="Practice"
          description="For something you want to do. Today can be marked as soon as you finish."
          example="e.g. Days I Went Running"
          tone="sage"
          icon={<CheckCircleIcon />}
          checked={value === 'practice'}
          onSelect={() => onChange('practice')}
          disabled={disabled}
        />
        <CompletionModeOption
          id="completion-mode-abstinence"
          title="Abstinence"
          description="For something you avoid. A day unlocks only after it has ended."
          example="e.g. Days Without Soda"
          tone="terracotta"
          icon={<ShieldIcon />}
          checked={value === 'abstinence'}
          onSelect={() => onChange('abstinence')}
          disabled={disabled}
        />
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-sm text-error-600">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}

function CompletionModeOption({
  id,
  title,
  description,
  example,
  tone,
  icon,
  checked,
  onSelect,
  disabled,
}: {
  id: string
  title: string
  description: string
  example: string
  tone: 'sage' | 'terracotta'
  icon: ReactNode
  checked: boolean
  onSelect: () => void
  disabled?: boolean
}) {
  return (
    <label
      className={cn(
        'group relative flex cursor-pointer gap-3 rounded-2xl border p-4 transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-terracotta-400/60 focus-within:outline-none',
        checked
          ? tone === 'sage'
            ? 'border-sage-400 bg-sage-50 shadow-organic-sm'
            : 'border-terracotta-400 bg-terracotta-50 shadow-organic-sm'
          : 'border-earth-200 bg-white hover:border-earth-300 hover:bg-earth-50/60',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      <input
        id={id}
        type="radio"
        name="completion-mode"
        checked={checked}
        onChange={onSelect}
        disabled={disabled}
        className="sr-only"
        aria-describedby={`${id}-description`}
      />
      <span
        className={cn(
          'mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl transition-colors',
          tone === 'sage'
            ? checked
              ? 'bg-sage-500 text-white'
              : 'bg-sage-100 text-sage-600'
            : checked
              ? 'bg-terracotta-500 text-white'
              : 'bg-terracotta-100 text-terracotta-600',
        )}
      >
        {icon}
      </span>
      <span>
        <span className="block font-display text-base font-semibold text-earth-900">
          {title}
        </span>
        <span
          id={`${id}-description`}
          className="mt-1 block text-sm leading-6 text-earth-600"
        >
          {description}
        </span>
        <span className="mt-1 block text-xs font-medium uppercase tracking-wide text-earth-400">
          {example}
        </span>
      </span>
    </label>
  )
}

function LockedCompletionMode({ mode }: { mode?: CompletionMode }) {
  if (!mode) return null
  return (
    <div className="rounded-2xl border border-dashed border-earth-300 bg-earth-50 px-4 py-3.5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-earth-500">
        Completion mode
      </p>
      <p className="mt-1 text-sm text-earth-700">
        <span className="font-semibold capitalize">{mode}</span> — chosen at
        creation and locked in.
      </p>
    </div>
  )
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m8.5 12.2 2.4 2.4 4.6-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.4-2.9 8.2-7 10-4.1-1.8-7-5.6-7-10V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 8v4M12 15.5v.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
