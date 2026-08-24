import { Link } from '@tanstack/react-router'
import type { Tracker } from '@/types/trackers'
import { Badge } from '@/components/ui'
import { ROUTES } from '@/lib/constants/routes'
import { formatDateString } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

interface TrackerHeaderProps {
  tracker: Tracker
  onDelete: () => void
  isDeleting?: boolean
}

export function TrackerHeader({ tracker, onDelete }: TrackerHeaderProps) {
  const isPractice = tracker.completionMode === 'practice'

  return (
    <header className="relative">
      <div className="pointer-events-none absolute -right-16 -top-24 hidden h-64 w-64 rounded-full border-[40px] border-earth-100/80 sm:block" />

      <Link
        to={ROUTES.dashboard}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-earth-500 transition-colors hover:text-earth-800 focus-ring rounded"
      >
        <ChevronLeftIcon className="size-4" />
        All trackers
      </Link>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-x-8 gap-y-6">
        <div className="min-w-0 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={isPractice ? 'sage' : 'terracotta'}>
              {tracker.completionMode}
            </Badge>
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-earth-400">
              Started {formatDateString(tracker.startDate, 'long')}
            </span>
          </div>

          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-earth-900 sm:text-5xl">
            {tracker.title}
          </h1>

          {tracker.description ? (
            <p className="mt-3 text-base leading-7 text-earth-600">
              {tracker.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-5 sm:items-stretch">
          <p className="text-right">
            <span
              aria-hidden="true"
              className="block font-display text-6xl font-semibold tracking-tight text-terracotta-600 tabular-nums sm:text-7xl animate-fade-in-up"
            >
              {tracker.daysCount.toLocaleString()}
            </span>
            <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.22em] text-earth-400">
              {tracker.daysCount === 1 ? 'TheDay' : 'TheDays'}
            </span>
            <span className="sr-only">{`${tracker.daysCount} completed days`}</span>
          </p>

          <div className="flex gap-2">
            <Link
              to={ROUTES.trackers.edit(tracker.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold',
                'text-earth-700 transition-colors hover:bg-earth-100 focus-ring',
              )}
            >
              <PencilIcon className="size-4" />
              Edit
            </Link>
            <button
              type="button"
              onClick={onDelete}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold',
                'text-error-600 transition-colors hover:bg-error-50 focus-ring',
              )}
            >
              <TrashIcon className="size-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="m4 20 .8-3.2L16.9 4.7a1.8 1.8 0 0 1 2.6 0l-.2-.2a1.8 1.8 0 0 1 0 2.6L7.2 19.2 4 20z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 7h16M9.5 4h5a1 1 0 0 1 1 1v2h-7V5a1 1 0 0 1 1-1zM6 10.5h12M6.5 10.5V19a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5v-8.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
