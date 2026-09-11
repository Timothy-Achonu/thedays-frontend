import { Link } from '@tanstack/react-router'
import type { TrackerWithDays } from '../hooks/use-trackers-with-days'
import type { DailyStatusTone } from '../daily-status'
import type { CompletionMode } from '@/types/trackers'
import { Badge } from '@/components/ui'
import { ROUTES } from '@/lib/constants/routes'
import { formatDateString } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

const modeBadgeTone: Record<CompletionMode, 'sage' | 'terracotta'> = {
  practice: 'sage',
  abstinence: 'terracotta',
}

const statusToneStyles: Record<DailyStatusTone, string> = {
  sage: 'text-sage-700 bg-sage-100/80 ring-sage-200',
  earth: 'text-earth-600 bg-earth-100/70 ring-earth-200',
  sand: 'text-sand-800 bg-sand-100/90 ring-sand-300',
  error: 'text-error-700 bg-error-50 ring-error-200',
}

export function TrackerCard({
  entry,
  index,
}: {
  entry: TrackerWithDays
  index: number
}) {
  const { tracker, status, statusState } = entry

  return (
    <Link
      to={ROUTES.trackers.detail(tracker.id)}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-earth-100 bg-white p-6 shadow-organic-sm',
        'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-earth-200 hover:shadow-organic-lg focus-ring animate-fade-in-up',
      )}
      style={{
        animationDelay: `${Math.min(index, 8) * 60}ms`,
        animationFillMode: 'backwards',
      }}
    >
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 top-0 h-1 opacity-70 transition-opacity duration-300 group-hover:opacity-100',
          tracker.completionMode === 'practice'
            ? 'bg-gradient-to-r from-sage-400 to-sage-600'
            : 'bg-gradient-to-r from-terracotta-400 via-sand-400 to-terracotta-500',
        )}
      />

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-semibold leading-snug text-earth-900">
          {tracker.title}
        </h3>
        <Badge tone={modeBadgeTone[tracker.completionMode]}>
          {tracker.completionMode === 'practice' ? (
            <PracticeIcon className="size-3" />
          ) : (
            <AbstinenceIcon className="size-3" />
          )}
          {tracker.completionMode}
        </Badge>
      </div>

      {tracker.description ? (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-earth-500">
          {tracker.description}
        </p>
      ) : null}

      <p className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-4xl font-semibold tracking-tight text-terracotta-600">
          {tracker.daysCount.toLocaleString()}
        </span>
        <span className="text-sm font-medium text-earth-400">
          {tracker.daysCount === 1 ? 'day' : 'days'}
        </span>
      </p>

      <div className="mt-5 space-y-2 border-t border-dashed border-earth-200 pt-4">
        {statusState === 'loading' ? (
          <div
            className="h-7 animate-pulse-soft rounded-lg bg-earth-100"
            aria-label="Daily status loading"
          />
        ) : statusState === 'failed' ? (
          <p className="rounded-lg bg-error-50 px-2.5 py-1.5 text-xs font-semibold text-error-700 ring-1 ring-inset ring-error-200">
            Daily status unavailable
          </p>
        ) : status ? (
          status.lines.map((line) => (
            <p
              key={line.label}
              className={cn(
                'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset',
                statusToneStyles[line.tone],
              )}
            >
              <span>{line.label}</span>
              <span className="font-semibold">{line.value}</span>
            </p>
          ))
        ) : null}

        <p className="px-0.5 pt-1 text-xs text-earth-400">
          Started {formatDateString(tracker.startDate, 'long')}
        </p>
      </div>

      <span
        aria-hidden="true"
        className="mt-auto pt-4 text-sm font-semibold text-terracotta-600 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
      >
        Open tracker →
      </span>
    </Link>
  )
}

function PracticeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AbstinenceIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5.5 5.5l13 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
