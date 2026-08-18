import {
  forwardRef,
  useState,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: {
    input: 'px-3 py-2 text-sm',
    label: 'text-xs',
    iconSize: 'h-4 w-4',
    iconPadding: 'pl-9',
  },
  md: {
    input: 'px-4 py-3 text-base',
    label: 'text-sm',
    iconSize: 'h-5 w-5',
    iconPadding: 'pl-11',
  },
  lg: {
    input: 'px-4 py-3.5 text-lg',
    label: 'text-base',
    iconSize: 'h-5 w-5',
    iconPadding: 'pl-12',
  },
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      size = 'md',
      className,
      id,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const errorId = `${inputId}-error`
    const hintId = `${inputId}-hint`

    const styles = sizeStyles[size]
    const hasError = Boolean(error)

    return (
      <div className={cn('w-full', className)}>
        <label
          htmlFor={inputId}
          className={cn(
            'block font-medium mb-1.5',
            styles.label,
            hasError ? 'text-error-600' : 'text-earth-700',
            disabled && 'text-earth-400',
          )}
        >
          {label}
          {required && <span className="text-terracotta-500 ml-0.5">*</span>}
        </label>

        <div className="relative">
          {leftIcon && (
            <span
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 text-earth-400',
                styles.iconSize,
                hasError && 'text-error-500',
              )}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : hint ? hintId : undefined
            }
            className={cn(
              'w-full rounded-xl border bg-white font-body',
              'transition-all duration-200 ease-out',
              'placeholder:text-earth-400',
              'focus-ring',
              styles.input,
              leftIcon && styles.iconPadding,
              rightIcon && 'pr-11',
              hasError
                ? 'border-error-500 text-error-900 focus:border-error-500'
                : 'border-earth-200 text-earth-900 hover:border-earth-300 focus:border-terracotta-400',
              disabled &&
                'bg-earth-100 text-earth-500 cursor-not-allowed border-earth-200',
            )}
            {...props}
          />

          {rightIcon && (
            <span
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                styles.iconSize,
              )}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {hasError && (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-sm text-error-600 flex items-center gap-1"
          >
            <ErrorIcon className="h-4 w-4 shrink-0" />
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

Input.displayName = 'Input'

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  )
}

interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showStrength?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [strength, setStrength] = useState(0)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showStrength) {
        setStrength(calculatePasswordStrength(e.target.value))
      }
      props.onChange?.(e)
    }

    return (
      <div className="w-full">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-earth-500 hover:text-earth-700 transition-colors focus-ring rounded"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          }
          {...props}
          onChange={handleChange}
        />

        {showStrength && props.value && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors duration-200',
                    strength >= level
                      ? strengthColors[strength as keyof typeof strengthColors]
                      : 'bg-earth-200',
                  )}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-earth-500">
              {strengthLabels[strength as keyof typeof strengthLabels]}
            </p>
          </div>
        )}
      </div>
    )
  },
)

PasswordInput.displayName = 'PasswordInput'

const strengthColors = {
  1: 'bg-error-500',
  2: 'bg-warning-500',
  3: 'bg-sage-400',
  4: 'bg-sage-600',
}

const strengthLabels = {
  0: '',
  1: 'Weak password',
  2: 'Fair password',
  3: 'Good password',
  4: 'Strong password',
}

function calculatePasswordStrength(password: string): number {
  if (!password) return 0

  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  return Math.min(4, score)
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}
