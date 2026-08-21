import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { User } from '@/lib/common/models'
import { ROUTES } from '@/lib/constants/routes'
import {
  detectBrowserTimezone,
  dismissTimezoneMismatch,
  formatTimezoneLabel,
  isTimezoneMismatchDismissed,
} from '@/lib/utils/timezone'

export function TimezoneMismatchBanner({ user }: { user: User }) {
  const detectedTimezone = useMemo(detectBrowserTimezone, [])
  const [dismissed, setDismissed] = useState(() =>
    detectedTimezone
      ? isTimezoneMismatchDismissed(
          user.id,
          user.timezone,
          detectedTimezone,
        )
      : true,
  )

  if (
    !detectedTimezone ||
    detectedTimezone === user.timezone ||
    dismissed
  ) {
    return null
  }

  const handleDismiss = () => {
    dismissTimezoneMismatch(user.id, user.timezone, detectedTimezone)
    setDismissed(true)
  }

  return (
    <aside
      aria-label="Timezone review"
      className="relative overflow-hidden rounded-2xl border border-sage-200 bg-sage-50 p-5 shadow-organic-sm"
    >
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full border-[18px] border-sage-100" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-600">
          Timezone check
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold text-earth-900">
          Your device is in a different timezone
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-earth-700">
          Your account uses {formatTimezoneLabel(user.timezone)}, while this
          device reports {formatTimezoneLabel(detectedTimezone)}. Your saved
          timezone decides which day counts as today.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            to={ROUTES.settings}
            className="rounded-xl bg-sage-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sage-700 focus-ring"
          >
            Review in Settings
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg px-2 py-2 text-sm font-medium text-earth-600 transition-colors hover:text-earth-900 focus-ring"
          >
            Dismiss for now
          </button>
        </div>
      </div>
    </aside>
  )
}
