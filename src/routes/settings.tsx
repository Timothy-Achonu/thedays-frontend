import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import type { FormEvent } from 'react'
import { Button, Card, TimezoneSelect } from '@/components/ui'
import {
  useCurrentUserQuery,
  useUpdateCurrentUserMutation,
} from '@/lib/app/auth'
import { requireAuth } from '@/lib/auth/guards'
import { ROUTES } from '@/lib/constants/routes'
import { getFieldError, parseApiError } from '@/lib/utils'
import { getCalendarDateInTimezone } from '@/lib/utils/timezone'

export const Route = createFileRoute('/settings')({
  beforeLoad: ({ context }) => requireAuth(context.queryClient),
  component: SettingsPage,
})

type DayShiftConfirmation = {
  previousDate: string
  nextDate: string
}

function SettingsPage() {
  const { data: user } = useCurrentUserQuery()
  const updateUserMutation = useUpdateCurrentUserMutation()
  const [timezone, setTimezone] = useState('UTC')
  const [timezoneError, setTimezoneError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<DayShiftConfirmation | null>(
    null,
  )

  useEffect(() => {
    if (user) setTimezone(user.timezone)
  }, [user])

  const saveTimezone = () => {
    if (!user) return

    setTimezoneError(null)
    setFormError(null)
    setSuccessMessage(null)
    setConfirmation(null)

    updateUserMutation.mutate(
      { timezone },
      {
        onSuccess: () => {
          setSuccessMessage(
            'Timezone updated. Your calendar now uses this setting.',
          )
        },
        onError: (error) => {
          const parsed = parseApiError(error)
          const fieldError = getFieldError(parsed, 'timezone')
          if (fieldError) {
            setTimezoneError(fieldError)
          } else {
            setFormError('We could not update your timezone. Please try again.')
          }
        },
      },
    )
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!user || timezone === user.timezone) return

    const now = new Date()
    const previousDate = getCalendarDateInTimezone(user.timezone, now)
    const nextDate = getCalendarDateInTimezone(timezone, now)

    if (previousDate !== nextDate) {
      setConfirmation({ previousDate, nextDate })
      setSuccessMessage(null)
      return
    }

    saveTimezone()
  }

  const handleTimezoneChange = (nextTimezone: string) => {
    setTimezone(nextTimezone)
    setTimezoneError(null)
    setFormError(null)
    setSuccessMessage(null)
    setConfirmation(null)
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-earth-50 px-5 py-10 sm:px-8">
      <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border-[52px] border-sage-100/70" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-terracotta-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-2xl">
        <Link
          to={ROUTES.dashboard}
          className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-earth-600 transition-colors hover:text-terracotta-700 focus-ring"
        >
          <span aria-hidden="true">←</span> Back to dashboard
        </Link>

        <header className="mb-8 mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
            Account settings
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-earth-900 sm:text-5xl">
            Keep your days in sync
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-earth-600">
            Your timezone determines when a new calendar day begins. Completed
            dates stay exactly where they are when this setting changes.
          </p>
        </header>

        <Card
          variant="elevated"
          padding="lg"
          className="relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-terracotta-400 via-sand-400 to-sage-500" />
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold text-earth-900">
                Calendar timezone
              </h2>
              <p className="mt-1 text-sm leading-6 text-earth-600">
                Use the place whose local day you want TheDays to follow.
              </p>
            </div>

            <TimezoneSelect
              value={timezone}
              onChange={handleTimezoneChange}
              error={timezoneError ?? undefined}
              disabled={!user || updateUserMutation.isPending}
              required
            />

            {confirmation ? (
              <div
                role="alert"
                className="rounded-2xl border border-warning-500/30 bg-warning-50 p-4"
              >
                <p className="font-medium text-earth-900">
                  This changes what counts as today
                </p>
                <p className="mt-1 text-sm leading-6 text-earth-700">
                  Your calendar will move from {confirmation.previousDate} to{' '}
                  {confirmation.nextDate} immediately. Existing completed days
                  will not move.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveTimezone}
                    isLoading={updateUserMutation.isPending}
                  >
                    Change timezone
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmation(null)}
                    disabled={updateUserMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}

            {formError ? (
              <p role="alert" className="text-sm text-error-600">
                {formError}
              </p>
            ) : null}
            {successMessage ? (
              <p role="status" className="text-sm text-success-700">
                {successMessage}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 border-t border-earth-100 pt-5">
              <Button
                type="submit"
                isLoading={updateUserMutation.isPending}
                disabled={
                  !user ||
                  timezone === user.timezone ||
                  updateUserMutation.isPending
                }
              >
                Save timezone
              </Button>
              {user ? (
                <span className="text-sm text-earth-500">
                  Currently {user.timezone}
                </span>
              ) : null}
            </div>
          </form>
        </Card>
      </div>
    </main>
  )
}
