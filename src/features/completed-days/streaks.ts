import type { CompletionMode } from '@/types/trackers'
import {
  addDaysToDate,
  compareDateStrings,
  inclusiveDayCount,
} from '@/lib/utils/dates'

export interface CompletionStreak {
  startDate: string
  endDate: string
  dayCount: number
}

export interface StreakSummary {
  streaks: Array<CompletionStreak>
  currentStreak: CompletionStreak | null
}

export function getLatestEligibleDate(
  completionMode: CompletionMode,
  today: string,
): string {
  return completionMode === 'practice' ? today : addDaysToDate(today, -1)
}

export function getCompletionStreaks({
  completedDates,
  completionMode,
  startDate,
  today,
}: {
  completedDates: Iterable<string>
  completionMode: CompletionMode
  startDate: string
  today: string
}): StreakSummary {
  const latestEligibleDate = getLatestEligibleDate(completionMode, today)
  const sortedDates = Array.from(new Set(completedDates))
    .filter(
      (date) =>
        compareDateStrings(date, startDate) >= 0 &&
        compareDateStrings(date, latestEligibleDate) <= 0,
    )
    .sort(compareDateStrings)

  const runs: Array<CompletionStreak> = []
  let currentRunStart: string | null = null
  let previousDate: string | null = null

  const finishRun = () => {
    if (!currentRunStart || !previousDate) return
    runs.push({
      startDate: currentRunStart,
      endDate: previousDate,
      dayCount: inclusiveDayCount(currentRunStart, previousDate),
    })
  }

  sortedDates.forEach((date) => {
    if (!currentRunStart) {
      currentRunStart = date
      previousDate = date
      return
    }

    if (previousDate && addDaysToDate(previousDate, 1) === date) {
      previousDate = date
      return
    }

    finishRun()
    currentRunStart = date
    previousDate = date
  })

  finishRun()

  const currentStreak =
    runs.find((run) => run.endDate === latestEligibleDate) ?? null

  return {
    streaks: runs.filter((run) => run.dayCount >= 2),
    currentStreak,
  }
}

export function isPerfectClosedMonth({
  completedDates,
  completionMode,
  monthKey,
  startDate,
  today,
}: {
  completedDates: ReadonlySet<string>
  completionMode: CompletionMode
  monthKey: string
  startDate: string
  today: string
}): boolean {
  const monthStart = `${monthKey}-01`
  const nextMonthStart = addMonths(monthStart, 1)
  const monthEnd = addDaysToDate(nextMonthStart, -1)
  const latestEligibleDate = getLatestEligibleDate(completionMode, today)

  if (compareDateStrings(monthEnd, latestEligibleDate) > 0) {
    return false
  }

  const firstRequiredDate =
    compareDateStrings(startDate, monthStart) > 0 ? startDate : monthStart

  if (compareDateStrings(firstRequiredDate, monthEnd) > 0) {
    return false
  }

  let cursor = firstRequiredDate
  while (compareDateStrings(cursor, monthEnd) <= 0) {
    if (!completedDates.has(cursor)) return false
    cursor = addDaysToDate(cursor, 1)
  }

  return true
}

function addMonths(date: string, amount: number): string {
  const [year, month, day] = date.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1 + amount, day))
  const nextYear = next.getUTCFullYear()
  const nextMonth = `${next.getUTCMonth() + 1}`.padStart(2, '0')
  const nextDay = `${next.getUTCDate()}`.padStart(2, '0')
  return `${nextYear}-${nextMonth}-${nextDay}`
}
