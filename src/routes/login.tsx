import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import type { FormEvent } from 'react'
import { AuthLayout } from '@/layouts'
import { Button, Card, Input, PasswordInput } from '@/components/ui'
import { GoogleSignIn } from '@/components/auth/google-sign-in'
import { ROUTES } from '@/lib/constants/routes'
import { useLoginMutation } from '@/lib/app/auth'
import { requireGuest } from '@/lib/auth/guards'
import { getAuthErrorMessage, getFieldError, parseApiError } from '@/lib/utils'
import { cn } from '@/lib/utils/cn'

export const Route = createFileRoute('/login')({
  beforeLoad: requireGuest,
  component: LoginPage,
})

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [shakeForm, setShakeForm] = useState(false)

  const loginMutation = useLoginMutation()
  const navigate = useNavigate()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFieldErrors({})

    if (!email.trim()) {
      setFieldErrors((prev) => ({ ...prev, email: 'Email is required' }))
      return
    }

    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: 'Password is required' }))
      return
    }

    loginMutation.mutate(
      { email: email.trim().toLowerCase(), password },
      {
        onError: (error) => {
          const parsed = parseApiError(error)

          if (parsed.code === 'EMAIL_NOT_VERIFIED') {
            void navigate({
              to: '/verify-email',
              search: { email: email.trim().toLowerCase() },
            })
            return
          }

          if (parsed.code === 'VALIDATION_ERROR') {
            setFieldErrors({
              email: getFieldError(parsed, 'email') || '',
              password: getFieldError(parsed, 'password') || '',
            })
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

  const isLoading = loginMutation.isPending

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your progress"
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
          {/* Email Input */}
          <div className="animate-fade-in-up stagger-1">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
          </div>

          {/* Password Input */}
          <div className="animate-fade-in-up stagger-2">
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end animate-fade-in-up stagger-3">
            <button
              type="button"
              className="text-sm text-terracotta-600 hover:text-terracotta-700 font-medium focus-ring rounded"
              onClick={() => setFormError('Password reset coming soon!')}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <div className="animate-fade-in-up stagger-4">
            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Sign in
            </Button>
          </div>
        </form>

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
            onError={(message) => {
              setFormError(message)
              triggerShake()
            }}
          />
        </div>

        {/* Register Link */}
        <p className="mt-6 text-center text-earth-600 animate-fade-in stagger-6">
          Don't have an account?{' '}
          <Link
            to={ROUTES.register}
            className="text-terracotta-600 hover:text-terracotta-700 font-semibold focus-ring rounded"
          >
            Create one
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
