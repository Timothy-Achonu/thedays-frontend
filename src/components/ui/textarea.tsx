import { forwardRef, useId } from 'react'
import type { ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'size'
> {
  label: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, hint, className, id, disabled, required, ...props },
    ref,
  ) => {
    const generatedId = useId()
    const textareaId = id || generatedId
    const errorId = `${textareaId}-error`
    const hintId = `${textareaId}-hint`
    const hasError = Boolean(error)

    return (
      <div className={cn('w-full', className)}>
        <label
          htmlFor={textareaId}
          className={cn(
            'mb-1.5 block text-sm font-medium',
            hasError ? 'text-error-600' : 'text-earth-700',
            disabled && 'text-earth-400',
          )}
        >
          {label}
          {required && <span className="ml-0.5 text-terracotta-500">*</span>}
        </label>

        <textarea
          ref={ref}
          id={textareaId}
          rows={3}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : hint ? hintId : undefined}
          className={cn(
            'w-full resize-y rounded-xl border bg-white px-4 py-3 font-body text-base',
            'transition-all duration-200 ease-out',
            'placeholder:text-earth-400',
            'focus-ring',
            hasError
              ? 'border-error-500 text-error-900 focus:border-error-500'
              : 'border-earth-200 text-earth-900 hover:border-earth-300 focus:border-terracotta-400',
            disabled &&
              'cursor-not-allowed border-earth-200 bg-earth-100 text-earth-500',
          )}
          {...props}
        />

        {hasError && (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 flex items-center gap-1 text-sm text-error-600"
          >
            {error}
          </p>
        )}

        {hint && !hasError && (
          <p id={hintId} className="mt-1.5 text-sm text-earth-500">
            {hint}
          </p>
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'

interface BadgeProps {
  children: ReactNode
  tone?: 'sage' | 'terracotta' | 'sand' | 'neutral'
  className?: string
}

const badgeTones = {
  sage: 'bg-sage-100 text-sage-700 ring-sage-200',
  terracotta: 'bg-terracotta-50 text-terracotta-700 ring-terracotta-200',
  sand: 'bg-sand-100 text-earth-800 ring-sand-300',
  neutral: 'bg-earth-100 text-earth-600 ring-earth-200',
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
