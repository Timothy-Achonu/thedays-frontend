import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import type { FormEvent } from 'react'
import { AuthLayout } from '@/layouts'
import {
  Button,
  Card,
  Input,
  PasswordInput,
  TimezoneSelect,
} from '@/components/ui'
import { GoogleSignIn } from '@/components/auth/google-sign-in'
import { ROUTES } from '@/lib/constants/routes'
import { useRegisterMutation } from '@/lib/app/auth'
import { requireGuest } from '@/lib/auth/guards'
import { getAuthErrorMessage, getFieldError, parseApiError } from '@/lib/utils'
import { cn } from '@/lib/utils/cn'
import { getDefaultTimezone } from '@/lib/utils/timezone'

export const Route = createFileRoute('/register')({
  beforeLoad: requireGuest,
  component: RegisterPage,
})

function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [timezone, setTimezone] = useState(getDefaultTimezone)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [shakeForm, setShakeForm] = useState(false)

  const registerMutation = useRegisterMutation()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFieldErrors({})

    const errors: Record<string, string> = {}

    const trimmedUsername = username.trim().toLowerCase()
    if (!trimmedUsername) {
      errors.username = 'Username is required'
    } else if (trimmedUsername.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    } else if (trimmedUsername.length > 30) {
      errors.username = 'Username must be at most 30 characters'
    } else if (!/^[a-z][a-z0-9_]*$/.test(trimmedUsername)) {
      errors.username =
        'Username must start with a letter and contain only lowercase letters, numbers, and underscores'
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (!timezone) {
      errors.timezone = 'Timezone is required'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      triggerShake()
      return
    }

    registerMutation.mutate(
      { username: trimmedUsername, email: trimmedEmail, password, timezone },
      {
        onError: (error) => {
          const parsed = parseApiError(error)

          if (parsed.code === 'EMAIL_DELIVERY_FAILED') {
            return
          }

          if (parsed.code === 'VALIDATION_ERROR') {
            setFieldErrors({
              username: getFieldError(parsed, 'username') || '',
              email: getFieldError(parsed, 'email') || '',
              password: getFieldError(parsed, 'password') || '',
              timezone: getFieldError(parsed, 'timezone') || '',
            })
          } else if (
            parsed.code === 'USERNAME_TAKEN' ||
            parsed.code === 'EMAIL_ALREADY_REGISTERED'
          ) {
            if (parsed.code === 'USERNAME_TAKEN') {
              setFieldErrors((prev) => ({
                ...prev,
                username: 'This username is already taken',
              }))
            } else {
              setFieldErrors((prev) => ({
                ...prev,
                email: 'An account with this email already exists',
              }))
            }
          } else {
            setFormError(getAuthErrorMessage(parsed.code))
          }

          triggerShake()
        },
      },
    )
  }

  const triggerShake = () => {
    setShakeForm(true)
    setTimeout(() => setShakeForm(false), 500)
  }

  const isLoading = registerMutation.isPending

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your progress today"
    >
      <Card
        variant="elevated"
        padding="lg"
        className={cn('animate-scale-in', shakeForm && 'animate-shake')}
      >
        {/* Form Error Alert */}
        {formError && (
          <div className="mb-6 p-4 rounded-xl bg-error-50 border border-error-200 animate-fade-in">
            <p className="text-error-700 text-sm flex items-center gap-2">
              <AlertIcon className="w-4 h-4 shrink-0" />
              {formError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div className="animate-fade-in-up stagger-1">
            <Input
              label="Username"
              type="text"
              placeholder="yourname"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              error={fieldErrors.username}
              disabled={isLoading}
              autoComplete="username"
              autoFocus
              hint="3-30 characters, letters, numbers, and underscores only"
            />
          </div>

          {/* Email Input */}
          <div className="animate-fade-in-up stagger-2">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          {/* Password Input */}
          <div className="animate-fade-in-up stagger-3">
            <PasswordInput
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              disabled={isLoading}
              autoComplete="new-password"
              showStrength
            />
          </div>

          {/* Timezone */}
          <div className="animate-fade-in-up stagger-4">
            <TimezoneSelect
              value={timezone}
              onChange={setTimezone}
              error={fieldErrors.timezone}
              disabled={isLoading}
              required
              hint="This decides which calendar day TheDays treats as today."
            />
          </div>

          {/* Submit Button */}
          <div className="animate-fade-in-up stagger-5">
            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Create account
            </Button>
          </div>
        </form>

        {/* Terms */}
        <p className="mt-4 text-xs text-earth-500 text-center animate-fade-in stagger-5">
          By creating an account, you agree to our{' '}
          <button className="text-terracotta-600 hover:underline">
            Terms of Service
          </button>{' '}
          and{' '}
          <button className="text-terracotta-600 hover:underline">
            Privacy Policy
          </button>
        </p>

        {/* Divider */}
        <div className="relative my-6 animate-fade-in stagger-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-earth-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-sm text-earth-500">
              or continue with
            </span>
          </div>
        </div>

        {/* Google Button */}
        <div className="animate-fade-in-up stagger-6">
          <GoogleSignIn
            disabled={isLoading}
            timezone={timezone}
            onError={(message) => {
              setFormError(message)
              triggerShake()
            }}
          />
        </div>

        {/* Login Link */}
        <p className="mt-6 text-center text-earth-600 animate-fade-in stagger-6">
          Already have an account?{' '}
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

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  )
}
