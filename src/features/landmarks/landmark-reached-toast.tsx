import type { Landmark } from '@/types/trackers'
import * as notify from '@/lib/utils/notify'

export type LandmarkReachedCopyInput = Pick<
  Landmark,
  'title' | 'targetCount' | 'celebrationDescription'
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
  landmarks: ReadonlyArray<LandmarkReachedCopyInput>,
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
        </>
      ) : (
        <>
          <p className="mt-1.5 font-display text-xl font-semibold tracking-tight text-earth-900">
            {copy.title}
          </p>
          <ul className="mt-2.5 space-y-2">
            {landmarks.map((landmark) => (
              <li
                key={`${landmark.targetCount}-${landmark.title ?? landmark.celebrationDescription}`}
                className="border-l-2 border-terracotta-300 pl-3"
              >
                <p className="font-display text-sm font-semibold text-earth-800 tabular-nums">
                  {landmark.targetCount.toLocaleString()} days
                  {landmark.title ? ` — ${landmark.title}` : ''}
                </p>
                <p className="text-sm italic leading-5 text-earth-600">
                  {landmark.celebrationDescription}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
