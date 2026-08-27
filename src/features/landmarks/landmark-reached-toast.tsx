import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Landmark, LandmarksResponse } from '@/types/trackers'
import { Button } from '@/components/ui'
import { landmarksQueryKey } from '@/lib/app/trackers/queries'
import { updateLandmark } from '@/lib/app/trackers/services'
import { getFieldError, getFormError, parseApiError } from '@/lib/utils'
import * as notify from '@/lib/utils/notify'

export type LandmarkReachedCopyInput = Pick<
  Landmark,
  'id' | 'trackerId' | 'title' | 'targetCount' | 'celebrationDescription'
>

export interface LandmarkReachedCopy {
  title: string
  subtitle: string
}

/**
 * Title + subtitle for the landmark-reached toast. One landmark names the
 * day count (and optional title); several are collapsed into a single card.
 */
export function formatLandmarkReachedToast(
  landmarks: ReadonlyArray<
    Pick<
      LandmarkReachedCopyInput,
      'title' | 'targetCount' | 'celebrationDescription'
    >
  >,
): LandmarkReachedCopy {
  if (landmarks.length === 0) {
    return { title: '', subtitle: '' }
  }

  if (landmarks.length === 1) {
    const landmark = landmarks[0]
    const days = landmark.targetCount.toLocaleString()
    return {
      title: landmark.title
        ? `${days} days — ${landmark.title}`
        : `${days}-day landmark reached`,
      subtitle: landmark.celebrationDescription,
    }
  }

  return {
    title: `${landmarks.length} landmarks reached`,
    subtitle: landmarks
      .map((landmark) => {
        const days = landmark.targetCount.toLocaleString()
        const detail = landmark.title ?? landmark.celebrationDescription
        return `${days} days: ${detail}`
      })
      .join('. '),
  }
}

export function toastLandmarkReached(
  landmarks: ReadonlyArray<LandmarkReachedCopyInput>,
): void {
  if (landmarks.length === 0) return

  notify.success({
    content: <LandmarkReachedToast landmarks={landmarks} />,
    autoClose: 12_000,
    closeOnClick: false,
  })
}

export function LandmarkReachedToast({
  landmarks,
}: {
  landmarks: ReadonlyArray<LandmarkReachedCopyInput>
}) {
  const copy = formatLandmarkReachedToast(landmarks)
  const isSingle = landmarks.length === 1
  const single = isSingle ? landmarks[0] : null

  return (
    <div role="status" className="min-w-0 flex-1 pr-1">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-terracotta-600">
        {isSingle ? 'Landmark reached' : 'Landmarks reached'}
      </p>

      {single ? (
        <>
          <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-earth-900 tabular-nums">
            {single.targetCount.toLocaleString()}
            <span className="ml-1.5 text-base font-medium text-earth-400">
              days
            </span>
          </p>
          {single.title ? (
            <p className="mt-0.5 font-display text-base font-semibold text-earth-800">
              {single.title}
            </p>
          ) : null}
          <blockquote className="mt-2.5 border-l-2 border-terracotta-300 pl-3">
            <span className="sr-only">Celebration plan: </span>
            <p className="text-sm italic leading-6 text-earth-600">
              {single.celebrationDescription}
            </p>
          </blockquote>
          <CelebrateToastButton landmark={single} className="mt-3" />
        </>
      ) : (
        <>
          <p className="mt-1.5 font-display text-xl font-semibold tracking-tight text-earth-900">
            {copy.title}
          </p>
          <ul className="mt-2.5 space-y-2">
            {landmarks.map((landmark) => (
              <li
                key={landmark.id}
                className="border-l-2 border-terracotta-300 pl-3"
              >
                <p className="font-display text-sm font-semibold text-earth-800 tabular-nums">
                  {landmark.targetCount.toLocaleString()} days
                  {landmark.title ? ` — ${landmark.title}` : ''}
                </p>
                <p className="text-sm italic leading-5 text-earth-600">
                  {landmark.celebrationDescription}
                </p>
                <CelebrateToastButton landmark={landmark} className="mt-2" />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function CelebrateToastButton({
  landmark,
  className,
}: {
  landmark: LandmarkReachedCopyInput
  className?: string
}) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const daysLabel = `${landmark.targetCount.toLocaleString()}-day`

  if (done) {
    return (
      <p className={`text-xs font-semibold uppercase tracking-wider text-sage-700 ${className ?? ''}`}>
        Celebrated
      </p>
    )
  }

  return (
    <div className={className}>
      <Button
        type="button"
        size="sm"
        variant="primary"
        isLoading={isPending}
        disabled={isPending}
        aria-label={`Mark the ${daysLabel} celebration as done`}
        onClick={(event) => {
          event.stopPropagation()
          setError(null)
          setIsPending(true)

          const queryKey = landmarksQueryKey(landmark.trackerId)
          const previous = queryClient.getQueryData<LandmarksResponse>(queryKey)
          if (previous) {
            queryClient.setQueryData<LandmarksResponse>(queryKey, {
              landmarks: previous.landmarks.map((item) =>
                item.id === landmark.id
                  ? {
                      ...item,
                      celebrated: true,
                      celebratedAt: item.celebratedAt ?? new Date().toISOString(),
                    }
                  : item,
              ),
            })
          }

          void updateLandmark(landmark.trackerId, landmark.id, { celebrated: true })
            .then((response) => {
              queryClient.setQueryData<LandmarksResponse>(queryKey, (current) => {
                if (!current) return current
                return {
                  landmarks: current.landmarks.map((item) =>
                    item.id === response.landmark.id ? response.landmark : item,
                  ),
                }
              })
              setDone(true)
            })
            .catch((submitError: unknown) => {
              if (previous) queryClient.setQueryData(queryKey, previous)
              const parsed = parseApiError(submitError)
              setError(
                getFieldError(parsed, 'celebrated') ??
                  getFormError(parsed) ??
                  'The celebration could not be saved.',
              )
            })
            .finally(() => {
              setIsPending(false)
              void queryClient.invalidateQueries({ queryKey })
            })
        }}
      >
        I celebrated this
      </Button>
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-error-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}
