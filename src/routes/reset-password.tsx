import { useLayoutEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { AuthLayout } from '@/layouts'
import { Button, Card, PasswordInput } from '@/components/ui'
import { ROUTES } from '@/lib/constants/routes'
import { useResetPasswordMutation } from '@/lib/app/auth'
import { markSessionSignedOut } from '@/lib/auth/session-state'
import { getAuthErrorMessage, getFieldError, parseApiError } from '@/lib/utils'
import { cn } from '@/lib/utils/cn'

const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 128
const MAX_TOKEN_LENGTH = 256

function readResetToken(): string {
  if (typeof window === 'undefined') return ''

  const fragment = window.location.hash.slice(1)
  return new URLSearchParams(fragment).get('token')?.trim() ?? ''
}

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const [token] = useState(readResetToken)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [tokenRejected, setTokenRejected] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)
  const [shakeForm, setShakeForm] = useState(false)
  const resetPasswordMutation = useResetPasswordMutation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const hasUsableToken = token.length > 0 && token.length <= MAX_TOKEN_LENGTH
  const linkUnavailable = !hasUsableToken || tokenRejected

  useLayoutEffect(() => {
    if (!window.location.hash) return

    window.history.replaceState(
      window.history.state,
      document.title,
      `${window.location.pathname}${window.location.search}`,
    )
  }, [])

  const triggerShake = () => {
    setShakeForm(true)
    window.setTimeout(() => setShakeForm(false), 500)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setFieldErrors({})
    setFormError(null)

    const errors: Record<string, string> = {}

    if (!newPassword) {
      errors.newPassword = 'Password is required'
    } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
      errors.newPassword = 'Password must be at least 8 characters'
    } else if (newPassword.length > MAX_PASSWORD_LENGTH) {
      errors.newPassword = 'Password must be at most 128 characters'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password'
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      triggerShake()
      return
    }

    resetPasswordMutation.mutate(
      { token, newPassword },
      {
        onSuccess: () => {
          markSessionSignedOut()
          queryClient.clear()
          setNewPassword('')
          setConfirmPassword('')
          setResetComplete(true)
        },
        onError: (error) => {
          const parsed = parseApiError(error)

          if (parsed.code === 'INVALID_OR_EXPIRED_RESET_TOKEN') {
            setTokenRejected(true)
            return
          }

          if (parsed.code === 'VALIDATION_ERROR') {
            if (getFieldError(parsed, 'token')) {
              setTokenRejected(true)
              return
            }

            setFieldErrors({
              newPassword: getFieldError(parsed, 'newPassword') || '',
            })
          } else {
            setFormError(getAuthErrorMessage(parsed.code))
          }

          triggerShake()
        },
      },
    )
  }

  const title = resetComplete
    ? 'Password updated'
    : linkUnavailable
      ? 'Reset link unavailable'
      : 'Create a new password'

  const subtitle = resetComplete
    ? 'Your account is secure and ready for a fresh sign-in'
    : linkUnavailable
      ? 'Request a new link to continue'
      : 'Choose something memorable and keep it private'

  return (
    <AuthLayout title={title} subtitle={subtitle} redirectAuthenticated={false}>
      <Card
        variant="elevated"
        padding="lg"
        className={cn('animate-scale-in', shakeForm && 'animate-shake')}
      >
        {resetComplete ? (
          <div className="text-center animate-fade-in" aria-live="polite">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-sage-100 text-sage-700">
              <CheckIcon className="size-7" />
            </div>
            <p className="mt-5 text-earth-700">
              Your password has been changed and all existing sessions have been
              signed out.
            </p>
            <Button
              type="button"
              fullWidth
              size="lg"
              className="mt-6"
              onClick={() => void navigate({ to: ROUTES.login })}
            >
              Sign in
            </Button>
          </div>
        ) : linkUnavailable ? (
          <div className="text-center animate-fade-in" role="alert">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-sand-100 text-terracotta-700">
              <LinkIcon className="size-7" />
            </div>
            <p className="mt-5 text-earth-700">
              This password reset link is missing, invalid, or has expired.
            </p>
            <p className="mt-2 text-sm text-earth-500">
              If you refreshed this page, reopen the original email link or
              request a new one.
            </p>
            <Link
              to={ROUTES.forgotPassword}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-terracotta-500 px-6 py-3 text-lg font-medium text-white shadow-organic-sm transition-all duration-200 hover:bg-terracotta-600 hover:shadow-organic-md focus-ring"
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <>
            {formError && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-error-200 bg-error-50 p-4 animate-fade-in"
              >
                <p className="text-sm text-error-700">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="animate-fade-in-up stagger-1">
                <PasswordInput
                  label="New password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  error={fieldErrors.newPassword}
                  disabled={resetPasswordMutation.isPending}
                  autoComplete="new-password"
                  autoFocus
                  showStrength
                  hint="8–128 characters"
                />
              </div>

              <div className="animate-fade-in-up stagger-2">
                <PasswordInput
                  label="Confirm new password"
                  placeholder="Enter it again"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  error={fieldErrors.confirmPassword}
                  disabled={resetPasswordMutation.isPending}
                  autoComplete="new-password"
                />
              </div>

              <div className="animate-fade-in-up stagger-3">
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={resetPasswordMutation.isPending}
                  disabled={resetPasswordMutation.isPending}
                >
                  Update password
                </Button>
              </div>
            </form>
          </>
        )}
      </Card>
    </AuthLayout>
  )
}

function CheckIcon({ className }: { className?: string }) {
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
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" />
      <path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15" />
    </svg>
  )
}
