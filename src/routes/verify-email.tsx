import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import type { FormEvent } from 'react'
import { AuthLayout } from '@/layouts'
import { Button, Card, Input } from '@/components/ui'
import { ROUTES } from '@/lib/constants/routes'
import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from '@/lib/app/auth'
import { requireGuest } from '@/lib/auth/guards'
import { getAuthErrorMessage, parseApiError } from '@/lib/utils'
import { cn } from '@/lib/utils/cn'

const RESEND_COOLDOWN_SECONDS = 60

type VerifyEmailSearch = {
  email?: string
  deliveryFailed?: boolean
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validateSearch(search: Record<string, unknown>): VerifyEmailSearch {
  const email =
    typeof search.email === 'string' ? search.email.trim().toLowerCase() : ''
  const deliveryFailed =
    search.deliveryFailed === true ||
    search.deliveryFailed === '1' ||
    search.deliveryFailed === 'true'

  return {
    ...(isValidEmail(email) ? { email } : {}),
    ...(deliveryFailed ? { deliveryFailed: true } : {}),
  }
}

export const Route = createFileRoute('/verify-email')({
  validateSearch,
  beforeLoad: requireGuest,
  component: VerifyEmailPage,
})

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${remainder.toString().padStart(2, '0')}`
}

function VerifyEmailPage() {
  const navigate = Route.useNavigate()
  const { email: searchEmail, deliveryFailed } = Route.useSearch()
  const [emailInput, setEmailInput] = useState(searchEmail ?? '')
  const [code, setCode] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [resendNotice, setResendNotice] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [shakeForm, setShakeForm] = useState(false)

  const verifyMutation = useVerifyEmailMutation()
  const resendMutation = useResendVerificationMutation()

  useEffect(() => {
    setEmailInput(searchEmail ?? '')
  }, [searchEmail])

  useEffect(() => {
    if (secondsLeft <= 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1)
    }, 1_000)

    return () => window.clearTimeout(timeoutId)
  }, [secondsLeft])

  const triggerShake = () => {
    setShakeForm(true)
    window.setTimeout(() => setShakeForm(false), 500)
  }

  const handleEmailContinue = (event: FormEvent) => {
    event.preventDefault()
    const trimmedEmail = emailInput.trim().toLowerCase()

    if (!isValidEmail(trimmedEmail)) {
      setFormError('Please enter the email you registered with.')
      triggerShake()
      return
    }

    setFormError(null)
    void navigate({
      search: deliveryFailed
        ? { email: trimmedEmail, deliveryFailed: true }
        : { email: trimmedEmail },
    })
  }

  const handleVerify = (event: FormEvent) => {
    event.preventDefault()
    if (!searchEmail) {
      return
    }

    setFormError(null)
    setCodeError(null)
    setResendNotice(null)

    if (!/^\d{6}$/.test(code)) {
      setCodeError('Enter the 6-digit code from your email.')
      triggerShake()
      return
    }

    verifyMutation.mutate(
      { email: searchEmail, code },
      {
        onError: (error) => {
          const parsed = parseApiError(error)
          if (parsed.code === 'INVALID_OR_EXPIRED_CODE') {
            setCodeError(getAuthErrorMessage(parsed.code))
          } else {
            setFormError(getAuthErrorMessage(parsed.code))
          }
          triggerShake()
        },
      },
    )
  }

  const handleResend = () => {
    if (!searchEmail || secondsLeft > 0 || resendMutation.isPending) {
      return
    }

    setFormError(null)
    setResendNotice(null)

    resendMutation.mutate(
      { email: searchEmail },
      {
        onSuccess: () => {
          setSecondsLeft(RESEND_COOLDOWN_SECONDS)
          setResendNotice(
            'If an account needs verification, we sent a new code.',
          )
          void navigate({
            search: { email: searchEmail },
            replace: true,
          })
        },
        onError: (error) => {
          setFormError(getAuthErrorMessage(parseApiError(error).code))
        },
      },
    )
  }

  const isVerifying = verifyMutation.isPending

  return (
    <AuthLayout
      title="Check your email"
      subtitle={
        deliveryFailed
          ? 'Resend your verification code to continue'
          : 'Enter the 6-digit code we sent to verify your account'
      }
    >
      <Card
        variant="elevated"
        padding="lg"
        className={cn('animate-scale-in', shakeForm && 'animate-shake')}
      >
        {deliveryFailed && (
          <div className="mb-6 p-4 rounded-xl bg-sand-50 border border-sand-200 animate-fade-in">
            <p className="text-earth-800 text-sm">
              Your account was created, but we could not send the verification
              email. Use Resend below to try again.
            </p>
          </div>
        )}

        {formError && (
          <div className="mb-6 p-4 rounded-xl bg-error-50 border border-error-200 animate-fade-in">
            <p className="text-error-700 text-sm">{formError}</p>
          </div>
        )}

        {!searchEmail ? (
          <form onSubmit={handleEmailContinue} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              autoComplete="email"
              autoFocus
            />
            <Button type="submit" fullWidth size="lg">
              Continue
            </Button>
          </form>
        ) : deliveryFailed ? (
          <Button
            type="button"
            fullWidth
            size="lg"
            isLoading={resendMutation.isPending}
            onClick={handleResend}
          >
            Resend code
          </Button>
        ) : (
          <>
            <p className="mb-5 text-sm text-earth-600">
              We sent a code to{' '}
              <span className="font-medium text-earth-900">
                {searchEmail}
              </span>
              .
            </p>

            {resendNotice && (
              <p className="mb-5 text-sm text-sage-700">{resendNotice}</p>
            )}

            <form onSubmit={handleVerify} className="space-y-5">
              <Input
                label="Verification code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                }
                error={codeError ?? undefined}
                disabled={isVerifying}
                autoFocus
              />
              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isVerifying}
                disabled={isVerifying}
              >
                Verify email
              </Button>
            </form>

            <div className="mt-6 text-center">
              {secondsLeft > 0 ? (
                <p className="text-sm text-earth-500">
                  You can request a new code in {formatCountdown(secondsLeft)}
                </p>
              ) : (
                <button
                  type="button"
                  className="text-sm text-terracotta-600 hover:text-terracotta-700 font-medium focus-ring rounded disabled:text-earth-400"
                  onClick={handleResend}
                  disabled={resendMutation.isPending}
                >
                  Resend code
                </button>
              )}
            </div>
          </>
        )}

        <p className="mt-6 text-center text-earth-600">
          Wrong email?{' '}
          <Link
            to={ROUTES.login}
            className="text-terracotta-600 hover:text-terracotta-700 font-semibold focus-ring rounded"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </AuthLayout>
  )
}
