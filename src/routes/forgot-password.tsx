import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import type { FormEvent } from 'react'
import { AuthLayout } from '@/layouts'
import { Button, Card, Input } from '@/components/ui'
import { ROUTES } from '@/lib/constants/routes'
import { useForgotPasswordMutation } from '@/lib/app/auth'
import { requireGuest } from '@/lib/auth/guards'
import { getAuthErrorMessage, getFieldError, parseApiError } from '@/lib/utils'
import { cn } from '@/lib/utils/cn'

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export const Route = createFileRoute('/forgot-password')({
  beforeLoad: requireGuest,
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const [shakeForm, setShakeForm] = useState(false)
  const forgotPasswordMutation = useForgotPasswordMutation()

  const triggerShake = () => {
    setShakeForm(true)
    window.setTimeout(() => setShakeForm(false), 500)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setEmailError(null)
    setFormError(null)

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setEmailError('Email is required')
      triggerShake()
      return
    }

    if (!isValidEmail(normalizedEmail)) {
      setEmailError('Please enter a valid email address')
      triggerShake()
      return
    }

    forgotPasswordMutation.mutate(
      { email: normalizedEmail },
      {
        onSuccess: (response) => setConfirmation(response.message),
        onError: (error) => {
          const parsed = parseApiError(error)

          if (parsed.code === 'VALIDATION_ERROR') {
            setEmailError(
              getFieldError(parsed, 'email') ||
                'Please enter a valid email address',
            )
          } else {
            setFormError(getAuthErrorMessage(parsed.code))
          }

          triggerShake()
        },
      },
    )
  }

  const startOver = () => {
    setConfirmation(null)
    setFormError(null)
    setEmailError(null)
  }

  return (
    <AuthLayout
      title={confirmation ? 'Check your email' : 'Reset your password'}
      subtitle={
        confirmation
          ? 'Follow the link in the email to choose a new password'
          : 'Enter your email and we’ll send recovery instructions'
      }
    >
      <Card
        variant="elevated"
        padding="lg"
        className={cn('animate-scale-in', shakeForm && 'animate-shake')}
      >
        {confirmation ? (
          <div className="text-center animate-fade-in" aria-live="polite">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-sage-100 text-sage-700">
              <MailIcon className="size-7" />
            </div>
            <p className="mt-5 text-earth-700">{confirmation}</p>
            <p className="mt-2 text-sm text-earth-500">
              If a link arrives, it will expire after 30 minutes. Check your
              spam folder if you do not see it.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                to={ROUTES.login}
                className="flex w-full items-center justify-center rounded-xl bg-terracotta-500 px-6 py-3 text-lg font-medium text-white shadow-organic-sm transition-all duration-200 hover:bg-terracotta-600 hover:shadow-organic-md focus-ring"
              >
                Back to sign in
              </Link>
              <button
                type="button"
                className="text-sm font-medium text-terracotta-600 hover:text-terracotta-700 focus-ring rounded"
                onClick={startOver}
              >
                Use a different email
              </button>
            </div>
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
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  error={emailError ?? undefined}
                  disabled={forgotPasswordMutation.isPending}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="animate-fade-in-up stagger-2">
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={forgotPasswordMutation.isPending}
                  disabled={forgotPasswordMutation.isPending}
                >
                  Send reset link
                </Button>
              </div>
            </form>

            <p className="mt-6 text-center text-earth-600 animate-fade-in stagger-3">
              Remembered your password?{' '}
              <Link
                to={ROUTES.login}
                className="font-semibold text-terracotta-600 hover:text-terracotta-700 focus-ring rounded"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </Card>
    </AuthLayout>
  )
}

function MailIcon({ className }: { className?: string }) {
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
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}
