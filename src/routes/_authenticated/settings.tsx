import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { User } from '@/lib/common/models'
import { Button, Card, Input, TimezoneSelect } from '@/components/ui'
import {
  useCurrentUserQuery,
  useUpdateCurrentUserMutation,
} from '@/lib/app/auth'
import { getAuthErrorMessage, getFieldError, parseApiError } from '@/lib/utils'
import { getCalendarDateInTimezone } from '@/lib/utils/timezone'

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
})

type DayShiftConfirmation = {
  previousDate: string
  nextDate: string
}

function SettingsPage() {
  const { data: user } = useCurrentUserQuery()
  const updateUserMutation = useUpdateCurrentUserMutation()
  const [username, setUsername] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [usernameFormError, setUsernameFormError] = useState<string | null>(
    null,
  )
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null)
  const [timezoneError, setTimezoneError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<DayShiftConfirmation | null>(
    null,
  )

  useEffect(() => {
    if (user) {
      setUsername(user.username)
      setTimezone(user.timezone)
    }
  }, [user])

  const saveUsername = (event: FormEvent) => {
    event.preventDefault()
    if (!user || !user.canChangeUsername) return

    setUsernameError(null)
    setUsernameFormError(null)
    setUsernameSuccess(null)

    const trimmedUsername = username.trim().toLowerCase()
    if (!trimmedUsername) {
      setUsernameError('Username is required')
      return
    }
    if (trimmedUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters')
      return
    }
    if (trimmedUsername.length > 30) {
      setUsernameError('Username must be at most 30 characters')
      return
    }
    if (!/^[a-z][a-z0-9_]*$/.test(trimmedUsername)) {
      setUsernameError(
        'Username must start with a letter and contain only lowercase letters, numbers, and underscores',
      )
      return
    }

    updateUserMutation.mutate(
      { username: trimmedUsername },
      {
        onSuccess: (updatedUser) => {
          setUsername(updatedUser.username)
          setUsernameSuccess('Username updated successfully.')
        },
        onError: (error) => {
          const parsed = parseApiError(error)
          const fieldError = getFieldError(parsed, 'username')
          if (fieldError) {
            setUsernameError(fieldError)
          } else {
            setUsernameFormError(getAuthErrorMessage(parsed.code))
          }
        },
      },
    )
  }

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
    <div className="relative min-h-[calc(100dvh-4.5rem)] overflow-hidden bg-earth-50 px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border-[52px] border-sage-100/70" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-terracotta-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-3xl">
        <header className="mb-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
            Your account
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-earth-900 sm:text-5xl">
            Settings
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-earth-600">
            Keep your profile and calendar preferences aligned with the way you
            experience each day.
          </p>
        </header>

        <div className="space-y-5">
          <ProfileSection
            user={user}
            username={username}
            usernameError={usernameError}
            usernameFormError={usernameFormError}
            usernameSuccess={usernameSuccess}
            onUsernameChange={(value) => {
              setUsername(value.toLowerCase())
              setUsernameError(null)
              setUsernameFormError(null)
              setUsernameSuccess(null)
            }}
            onUsernameSubmit={saveUsername}
            isUpdating={updateUserMutation.isPending}
          />

          <Card
            variant="elevated"
            padding="lg"
            className="relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-terracotta-400 via-sand-400 to-sage-500" />
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sage-600">
                  Calendar &amp; time
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-earth-900">
                  Keep your days in sync
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-earth-600">
                  Your timezone determines when a new calendar day begins.
                  Completed dates stay exactly where they are when this setting
                  changes.
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
      </div>
    </div>
  )
}

type ProfileSectionProps = {
  user: User | undefined
  username: string
  usernameError: string | null
  usernameFormError: string | null
  usernameSuccess: string | null
  onUsernameChange: (value: string) => void
  onUsernameSubmit: (event: FormEvent) => void
  isUpdating: boolean
}

function ProfileSection({
  user,
  username,
  usernameError,
  usernameFormError,
  usernameSuccess,
  onUsernameChange,
  onUsernameSubmit,
  isUpdating,
}: ProfileSectionProps) {
  const initials = user?.username.slice(0, 2).toUpperCase() ?? '—'

  return (
    <Card padding="lg" className="border-earth-200/70">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative grid size-20 shrink-0 place-items-center rounded-[1.75rem] bg-sage-100 font-display text-2xl font-semibold text-sage-700 shadow-inner">
          {initials}
          <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border-4 border-white bg-terracotta-500 text-white">
            <span className="size-1.5 rounded-full bg-white" />
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-terracotta-600">
            Profile
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-earth-900">
            {user ? user.username : 'Loading your profile'}
          </h2>
          <p className="mt-1 truncate text-sm text-earth-600">
            {user?.email ?? 'Your account details will appear here.'}
          </p>
        </div>
      </div>
      {user?.canChangeUsername ? (
        <form
          onSubmit={onUsernameSubmit}
          className="mt-6 space-y-4 border-t border-earth-100 pt-5"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sage-600">
              Username
            </p>
            <p className="mt-1 text-sm leading-6 text-earth-600">
              You can choose your username once. This change cannot be undone.
            </p>
          </div>
          <Input
            label="Username"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            error={usernameError ?? undefined}
            hint="3-30 characters, letters, numbers, and underscores only"
            disabled={isUpdating}
            autoComplete="username"
          />
          {usernameFormError ? (
            <p role="alert" className="text-sm text-error-600">
              {usernameFormError}
            </p>
          ) : null}
          {usernameSuccess ? (
            <p role="status" className="text-sm text-success-700">
              {usernameSuccess}
            </p>
          ) : null}
          <Button
            type="submit"
            isLoading={isUpdating}
            disabled={
              username.trim().toLowerCase() === user.username ||
              isUpdating
            }
          >
            Save username
          </Button>
        </form>
      ) : (
        <p className="mt-6 border-t border-earth-100 pt-4 text-sm leading-6 text-earth-600">
          Your username cannot be changed.
        </p>
      )}
    </Card>
  )
}
