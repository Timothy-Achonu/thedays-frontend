const UTC_TIMEZONE = 'UTC'

export function detectBrowserTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}

export function getDefaultTimezone(): string {
  return detectBrowserTimezone() ?? UTC_TIMEZONE
}

export function getSupportedTimezones(
  additionalTimezones: Array<string> = [],
): Array<string> {
  let supportedTimezones: Array<string> = []

  try {
    supportedTimezones = Intl.supportedValuesOf('timeZone')
  } catch {
    // Older browsers can still use the detected timezone and UTC.
  }

  return Array.from(
    new Set([
      UTC_TIMEZONE,
      ...additionalTimezones.filter(Boolean),
      ...supportedTimezones,
    ]),
  ).sort((left, right) => left.localeCompare(right))
}

export function getCalendarDateInTimezone(
  timezone: string,
  date = new Date(),
): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new Error(`Could not determine the calendar date for ${timezone}`)
  }

  return `${year}-${month}-${day}`
}

export function formatTimezoneLabel(timezone: string): string {
  if (timezone === UTC_TIMEZONE) return UTC_TIMEZONE
  return timezone.replaceAll('_', ' ')
}

function mismatchStorageKey(
  userId: string,
  savedTimezone: string,
  detectedTimezone: string,
): string {
  return `thedays:timezone-mismatch:${userId}:${savedTimezone}:${detectedTimezone}`
}

export function isTimezoneMismatchDismissed(
  userId: string,
  savedTimezone: string,
  detectedTimezone: string,
): boolean {
  try {
    return (
      window.sessionStorage.getItem(
        mismatchStorageKey(userId, savedTimezone, detectedTimezone),
      ) === 'dismissed'
    )
  } catch {
    return false
  }
}

export function dismissTimezoneMismatch(
  userId: string,
  savedTimezone: string,
  detectedTimezone = detectBrowserTimezone(),
): void {
  if (!detectedTimezone || savedTimezone === detectedTimezone) return

  try {
    window.sessionStorage.setItem(
      mismatchStorageKey(userId, savedTimezone, detectedTimezone),
      'dismissed',
    )
  } catch {
    // A dismissal is optional UI state; the account timezone remains authoritative.
  }
}
