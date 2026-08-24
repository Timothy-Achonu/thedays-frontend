/**
 * Calendar-date helpers for `YYYY-MM-DD` date-only values.
 *
 * The API contract speaks date-only strings; all conversions to JS Dates use
 * "local noon" so day boundaries survive both UTC shifts and DST changes.
 * String comparison of `YYYY-MM-DD` values is chronological.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false

  const parts = value.split('-').map(Number)
  const [, month, day] = parts
  return month >= 1 && month <= 12 && day >= 1 && day <= 31
}

/** Convert `YYYY-MM-DD` to a Date at local noon of that calendar day. */
export function dateStringToSafeDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

/** Convert a Date at local noon (see {@link dateStringToSafeDate}) back to `YYYY-MM-DD`. */
export function safeDateToDateString(value: Date): string {
  const year = value.getFullYear()
  const month = `${value.getMonth() + 1}`.padStart(2, '0')
  const day = `${value.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDaysToDate(date: string, amount: number): string {
  const safeDate = dateStringToSafeDate(date)
  safeDate.setDate(safeDate.getDate() + amount)
  return safeDateToDateString(safeDate)
}

/**
 * Every calendar day from `startDate` through `endDate`, inclusive.
 * Assumes `startDate <= endDate`; returns an empty array otherwise.
 */
export function enumerateDays(
  startDate: string,
  endDate: string,
): Array<string> {
  const days: Array<string> = []
  let cursor = startDate

  while (cursor <= endDate) {
    days.push(cursor)
    cursor = addDaysToDate(cursor, 1)
  }

  return days
}

export function compareDateStrings(left: string, right: string): number {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

/** Insert a date into an ascending sorted list without duplicates. */
export function insertDateSorted(
  dates: Array<string>,
  date: string,
): Array<string> {
  const next = [...dates]
  const index = next.findIndex((existing) => existing > date)

  if (index === -1) {
    next.push(date)
  } else if (next[index] !== date) {
    next.splice(index, 0, date)
  }

  return next
}

/** Remove a date from a list, returning a new array. */
export function removeDate(dates: Array<string>, date: string): Array<string> {
  return dates.filter((existing) => existing !== date)
}

type DateStyle = 'full' | 'long' | 'medium' | 'short'

/**
 * Format a date-only string with explicit UTC interpretation so the displayed
 * calendar day never shifts with the viewer's timezone.
 */
export function formatDateString(
  date: string,
  style: DateStyle = 'long',
): string {
  const formatter = new Intl.DateTimeFormat(undefined, {
    timeZone: 'UTC',
    dateStyle: style,
  })
  return formatter.format(new Date(`${date}T00:00:00Z`))
}

/** Format like "Friday, August 14" (or with the year when it differs from today's). */
export function formatDayListLabel(date: string, today: string): string {
  const includeYear = date.slice(0, 4) !== today.slice(0, 4)
  const formatter = new Intl.DateTimeFormat(undefined, {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
  })
  return formatter.format(new Date(`${date}T00:00:00Z`))
}
