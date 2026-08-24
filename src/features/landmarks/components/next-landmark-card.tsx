import type { Landmark } from '@/types/trackers'
import { cn } from '@/lib/utils/cn'

/**
 * The closest unreached landmark (the API returns landmarks sorted ascending
 * by targetCount), presented as a motivational strip per PRD §35.
 */
export function NextLandmarkCard({
  landmarks,
}: {
  landmarks: Array<Landmark>
}) {
  const next = landmarks.find((landmark) => !landmark.reached)

  if (!next) return null

  const progress = Math.min(
    1,
    next.currentCount / Math.max(1, next.targetCount),
  )

  return (
    <aside
      className={cn(
        'animate-fade-in-up relative overflow-hidden rounded-2xl p-[1px]',
        'bg-gradient-to-br from-terracotta-300 via-sand-300 to-sage-400 shadow-organic-md',
      )}
      aria-label="Next landmark"
    >
      <div className="rounded-[calc(1rem-1px)] bg-white/95 p-5 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta-600">
              Next landmark{next.title ? ` — ${next.title}` : ''}
            </p>
            <p className="mt-1.5 font-display text-2xl font-semibold text-earth-900 tabular-nums">
              {next.currentCount.toLocaleString()}
              <span className="text-earth-300"> / </span>
              {next.targetCount.toLocaleString()} days
            </p>
            <p className="mt-1 text-sm text-earth-500">
              <span className="font-semibold text-sage-700">
                {next.remaining.toLocaleString()}{' '}
                {next.remaining === 1 ? 'day' : 'days'}
              </span>{' '}
              remaining · 🎉 {next.celebrationDescription}
            </p>
          </div>

          <div
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress toward ${next.targetCount}-day landmark`}
            className="h-3 min-w-40 flex-1 overflow-hidden rounded-full bg-earth-100 sm:max-w-64"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-terracotta-400 via-sand-400 to-sage-500 transition-all duration-500 ease-out-expo"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
