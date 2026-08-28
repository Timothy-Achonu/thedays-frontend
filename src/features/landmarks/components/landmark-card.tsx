import type { Landmark } from '@/types/trackers'
import { cn } from '@/lib/utils/cn'

interface LandmarkCardProps {
  landmark: Landmark
  onEdit: () => void
  onDelete: () => void
  onCelebrate: () => void
  onUndoCelebrate: () => void
  isBusy?: boolean
}

export function LandmarkCard({
  landmark,
  onEdit,
  onDelete,
  onCelebrate,
  onUndoCelebrate,
  isBusy = false,
}: LandmarkCardProps) {
  const progress = Math.min(
    1,
    landmark.currentCount / Math.max(1, landmark.targetCount),
  )
  const pendingCelebration = landmark.reached && !landmark.celebrated
  const daysLabel = `${landmark.targetCount.toLocaleString()}-day`

  return (
    <article
      className={cn(
        'animate-scale-in group relative overflow-hidden rounded-2xl border p-5 transition-shadow duration-200',
        landmark.celebrated
          ? 'border-sage-400 bg-gradient-to-br from-sage-100 via-sage-50 to-white shadow-organic-md'
          : pendingCelebration
            ? 'border-terracotta-200 bg-gradient-to-br from-sage-50 via-white to-terracotta-50/40 shadow-organic-sm'
            : 'border-earth-100 bg-white shadow-organic-sm hover:shadow-organic-md',
        isBusy && 'opacity-70',
      )}
    >
      {landmark.reached ? (
        <div
          aria-hidden="true"
          className={cn(
            'absolute right-0 top-0 size-20 translate-x-6 -translate-y-6 rounded-full',
            landmark.celebrated ? 'bg-sage-300/70' : 'bg-sage-200/60',
          )}
        />
      ) : null}

      <div className="relative flex items-start gap-4">
        <ProgressRing
          progress={progress}
          reached={landmark.reached}
          celebrated={landmark.celebrated}
          label={`${Math.round(progress * 100)}% toward ${landmark.targetCount} days`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="font-display text-3xl font-semibold tracking-tight text-earth-900 tabular-nums">
              {landmark.targetCount.toLocaleString()}
            </p>
            <p className="text-sm font-medium text-earth-400">days</p>
          </div>

          {landmark.title ? (
            <p className="mt-0.5 truncate font-display text-base font-semibold text-earth-800">
              {landmark.title}
            </p>
          ) : null}

          <p
            aria-live="polite"
            className={cn(
              'mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider',
              landmark.celebrated
                ? 'bg-sage-200 text-sage-800'
                : landmark.reached
                  ? 'bg-sage-100 text-sage-700'
                  : 'bg-earth-100 text-earth-500',
            )}
          >
            {landmark.celebrated ? (
              <>
                <CheckIcon /> Celebrated
              </>
            ) : landmark.reached ? (
              <>
                <PartyIcon /> Reached — celebrate!
              </>
            ) : (
              `${landmark.remaining.toLocaleString()} ${
                landmark.remaining === 1 ? 'day' : 'days'
              } remaining`
            )}
          </p>
        </div>
      </div>

      <blockquote className="relative mt-4 border-l-2 border-terracotta-300 pl-3">
        <span className="sr-only">Celebration plan: </span>
        <p className="text-sm italic leading-6 text-earth-600">
          <span aria-hidden="true">🎉 </span>
          <span lang="zxx">{landmark.celebrationDescription}</span>
        </p>
      </blockquote>

      {pendingCelebration ? (
        <div className="relative mt-4">
          <button
            type="button"
            onClick={onCelebrate}
            disabled={isBusy}
            aria-label={`Mark the ${daysLabel} celebration as done`}
            className="text-xs font-semibold text-terracotta-600 underline-offset-2 transition-colors hover:text-terracotta-800 hover:underline focus-ring rounded-md px-0.5 disabled:cursor-wait"
          >
            Mark as celebrated
          </button>
        </div>
      ) : null}

      {landmark.celebrated ? (
        <div className="relative mt-4">
          <button
            type="button"
            onClick={onUndoCelebrate}
            disabled={isBusy}
            aria-label={`Undo celebration for the ${daysLabel} landmark`}
            className="text-xs font-semibold text-earth-500 underline-offset-2 transition-colors hover:text-earth-800 hover:underline focus-ring rounded-md px-0.5 disabled:cursor-wait"
          >
            Undo celebration
          </button>
        </div>
      ) : null}

      <div className="mt-4 flex justify-end gap-1 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          disabled={isBusy}
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-earth-600 transition-colors hover:bg-earth-100 hover:text-earth-800 focus-ring disabled:cursor-wait"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isBusy}
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-error-600 transition-colors hover:bg-error-50 focus-ring disabled:cursor-wait"
        >
          Delete
        </button>
      </div>
    </article>
  )
}

function ProgressRing({
  progress,
  reached,
  celebrated,
  label,
}: {
  progress: number
  reached: boolean
  celebrated: boolean
  label: string
}) {
  const radius = 26
  const circumference = 2 * Math.PI * radius

  return (
    <svg
      viewBox="0 0 64 64"
      className="size-16 shrink-0"
      role="img"
      aria-label={label}
    >
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke="var(--color-earth-100)"
        strokeWidth="7"
      />
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke={
          celebrated
            ? 'var(--color-sage-600)'
            : reached
              ? 'var(--color-sage-500)'
              : 'var(--color-terracotta-400)'
        }
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
        transform="rotate(-90 32 32)"
        style={{ transition: 'stroke-dashoffset 500ms var(--ease-out-expo)' }}
      />
      <text
        x="32"
        y="37"
        textAnchor="middle"
        fill={
          celebrated
            ? 'var(--color-sage-800)'
            : reached
              ? 'var(--color-sage-700)'
              : 'var(--color-earth-700)'
        }
        fontSize="15"
        fontWeight="700"
        fontFamily="var(--font-display)"
      >
        {celebrated ? '✓' : Math.round(progress * 100)}
      </text>
    </svg>
  )
}

function PartyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="size-3.5"
      aria-hidden="true"
    >
      <path
        d="M5 14 14 5l5 5-9 9H5v-5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13 8l3 3M18.5 3.5l.01.01M21 7l.01.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="size-3.5"
      aria-hidden="true"
    >
      <path
        d="M5 12.5 9.5 17 19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
