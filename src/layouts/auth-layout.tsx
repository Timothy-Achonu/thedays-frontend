import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Logo } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { useCurrentUserQuery } from '@/lib/app/auth/queries'
import { isUnauthorizedError } from '@/lib/auth/guards'
import {
  getSessionState,
  markSessionAuthenticated,
  markSessionSignedOut,
} from '@/lib/auth/session-state'
import { ROUTES } from '@/lib/constants/routes'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const [initialSessionState] = useState(getSessionState)
  const navigate = useNavigate()
  const currentUserQuery = useCurrentUserQuery(
    initialSessionState === 'unknown',
  )

  useEffect(() => {
    if (currentUserQuery.isSuccess) {
      markSessionAuthenticated()
      void navigate({ to: ROUTES.dashboard, replace: true })
      return
    }

    if (
      currentUserQuery.isError &&
      isUnauthorizedError(currentUserQuery.error)
    ) {
      markSessionSignedOut()
    }
  }, [
    currentUserQuery.error,
    currentUserQuery.isError,
    currentUserQuery.isSuccess,
    navigate,
  ])

  return (
    <div className="min-h-dvh lg:grid lg:h-dvh lg:grid-cols-2 lg:grid-rows-1">
      {/* Left Panel - Decorative */}
      <aside className="relative hidden min-h-dvh overflow-hidden lg:block lg:h-full">
        <DecorativePanel />
      </aside>

      {/* Right Panel - Form Content */}
      <main className="flex min-h-dvh flex-col overflow-y-auto bg-earth-50 lg:h-full">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 flex justify-center">
          <Link to="/" className="focus-ring rounded-lg">
            <Logo size="md" />
          </Link>
        </header>

        {/* Form Container */}
        <div className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {/* Title Section */}
            <div className="text-center mb-8 animate-fade-in-up">
              <h1 className="text-3xl sm:text-4xl font-display font-semibold text-earth-900 tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 text-earth-600 text-lg">{subtitle}</p>
              )}
            </div>

            {/* Form Content */}
            <div className="animate-fade-in-up stagger-2">{children}</div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-4 px-4 text-center">
          <p className="text-sm text-earth-500">Every day counts. No resets.</p>
        </footer>
      </main>
    </div>
  )
}

function DecorativePanel() {
  return (
    <div className="relative flex h-full min-h-dvh flex-col overflow-hidden bg-gradient-to-br from-terracotta-400 via-terracotta-500 to-terracotta-600 texture-noise">
      {/* Organic Shapes Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-float" />
        <div
          className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-sage-400/20 blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-sand-300/15 blur-2xl animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-float"
          style={{ animationDelay: '0.5s' }}
        />

        {/* Decorative rings */}
        <svg
          className="absolute top-20 right-20 w-32 h-32 text-white/20"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle
            cx="50"
            cy="50"
            r="25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>

        {/* Small accent dots */}
        <div className="absolute top-1/3 left-16 w-3 h-3 rounded-full bg-white/40" />
        <div className="absolute top-1/2 left-1/3 w-2 h-2 rounded-full bg-sage-200/50" />
        <div className="absolute bottom-1/3 right-24 w-4 h-4 rounded-full bg-white/30" />
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 rounded-full bg-sand-200/40" />
      </div>

      {/* Content Overlay */}
      <div className="relative flex flex-1 flex-col justify-between p-8 lg:p-12 xl:p-16">
        {/* Logo */}
        <div className="animate-fade-in-down">
          <Link to="/" className="inline-block focus-ring rounded-lg">
            <Logo
              size="lg"
              className="[&_span]:text-white [&_svg_circle:first-child]:fill-white/20"
            />
          </Link>
        </div>

        {/* Main Message */}
        <div className="space-y-6 max-w-lg animate-fade-in-up">
          <h2 className="text-4xl xl:text-5xl font-display font-semibold text-white leading-tight">
            Progress that
            <br />
            <span className="text-sand-200">never resets.</span>
          </h2>
          <p className="text-lg xl:text-xl text-white/80 leading-relaxed">
            Track your habits without the pressure of streaks. Every completed
            day adds to your total—missed days don't erase your progress.
          </p>
        </div>

        {/* Progress Visualization */}
        <div className="animate-fade-in stagger-4">
          <ProgressVisualization />
        </div>
      </div>
    </div>
  )
}

function ProgressVisualization() {
  const days = [
    { completed: true },
    { completed: true },
    { completed: false },
    { completed: true },
    { completed: true },
    { completed: false },
    { completed: true },
  ]

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/70 text-sm font-medium">This Week</span>
        <span className="text-white font-display text-2xl font-semibold">
          5 <span className="text-white/60 text-lg">days</span>
        </span>
      </div>

      <div className="flex gap-2">
        {days.map((day, index) => (
          <div
            key={index}
            className={cn(
              'flex-1 h-10 rounded-lg transition-all duration-300',
              day.completed
                ? 'bg-white shadow-sm'
                : 'bg-white/20 border border-white/30',
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))}
      </div>

      <p className="mt-4 text-white/60 text-sm">
        Missed days? No problem. Your progress continues.
      </p>
    </div>
  )
}
