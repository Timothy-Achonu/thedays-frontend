import type { CompletionMode, Tracker } from '@/types/trackers'
import { addDaysToDate } from '@/lib/utils/dates'

/**
 * State of a single calendar day relative to its tracker's rules.
 *
 * - `completed` — has a stored completion
 * - `bad` — has a stored Abstinence bad-day record
 * - `completable` — may be marked good now under the completion mode
 * - `unavailable` — visible but cannot be marked good yet
 */
export type DayState = 'completed' | 'bad' | 'completable' | 'unavailable'

/** The primary daily action day for a tracker, per PRD §27. */
export interface PrimaryDay {
  date: string
  /** "Today" on Practice; the latest finished day on Abstinence. */
  relativeLabel: string
}

/**
 * Returns the day the user should act on right now, or null when no day is
 * completable yet (an Abstinence tracker that started today).
 */
export function getPrimaryDay(
  tracker: Pick<Tracker, 'completionMode' | 'startDate'>,
  today: string,
): PrimaryDay | null {
  if (tracker.completionMode === 'practice') {
    return {
      date: today,
      relativeLabel: 'Today',
    }
  }

  const latestFinishedDay = addDaysToDate(today, -1)

  if (latestFinishedDay < tracker.startDate) {
    return null
  }

  return {
    date: latestFinishedDay,
    relativeLabel: 'Yesterday',
  }
}

export function canMarkOn(
  mode: CompletionMode,
  today: string,
  date: string,
): boolean {
  return mode === 'practice' ? date <= today : date < today
}

export function resolveDayState(
  mode: CompletionMode,
  today: string,
  date: string,
  isCompleted: boolean,
  isBad: boolean,
): DayState {
  if (isCompleted) return 'completed'
  if (isBad) return 'bad'
  return canMarkOn(mode, today, date) ? 'completable' : 'unavailable'
}

export type DailyStatusTone = 'sage' | 'earth' | 'sand' | 'error'

export interface TrackerDailyStatus {
  lines: Array<{ label: string; value: string; tone: DailyStatusTone }>
}

const COMPLETED_LABEL = '✓ Completed'
const NOT_MARKED_LABEL = 'Not yet marked'

/**
 * Mode-aware status copy for dashboard cards, per PRD §28/63:
 * Practice reports today only; Abstinence reports today-in-progress plus
 * yesterday's outcome.
 */
export function getTrackerDailyStatus(
  tracker: Pick<Tracker, 'completionMode' | 'startDate'>,
  completedDates: ReadonlySet<string>,
  badDates: ReadonlySet<string>,
  today: string,
): TrackerDailyStatus {
  const todayCompleted = completedDates.has(today)

  if (tracker.completionMode === 'practice') {
    return {
      lines: [
        {
          label: 'Today',
          value: todayCompleted ? COMPLETED_LABEL : NOT_MARKED_LABEL,
          tone: todayCompleted ? 'sage' : 'earth',
        },
      ],
    }
  }

  const lines: TrackerDailyStatus['lines'] = [
    badDates.has(today)
      ? { label: 'Today', value: 'Marked bad', tone: 'error' }
      : { label: 'Today', value: 'In progress', tone: 'sand' },
  ]

  const latestFinishedDay = addDaysToDate(today, -1)
  if (latestFinishedDay >= tracker.startDate) {
    const yesterdayCompleted = completedDates.has(latestFinishedDay)
    const yesterdayBad = badDates.has(latestFinishedDay)
    lines.push({
      label: 'Yesterday',
      value: yesterdayCompleted
        ? COMPLETED_LABEL
        : yesterdayBad
          ? 'Marked bad'
          : NOT_MARKED_LABEL,
      tone: yesterdayCompleted ? 'sage' : yesterdayBad ? 'error' : 'earth',
    })
  }

  return { lines }
}
