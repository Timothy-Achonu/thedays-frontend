/** Domain types for trackers, completed days, and landmarks. */

export type CompletionMode = 'practice' | 'abstinence'

/**
 * Tracker summary returned by the API.
 *
 * `daysCount` is computed server-side (count of completed days) and must never
 * be derived from `today - startDate` on the client.
 */
export interface Tracker {
  id: string
  title: string
  description: string | null
  startDate: string
  completionMode: CompletionMode
  createdAt: string
  updatedAt: string
  daysCount: number
}

export interface CreateTrackerInput {
  title: string
  description?: string
  startDate: string
  completionMode: CompletionMode
}

/**
 * Partial update. Send only changed fields (the backend rejects unknown keys
 * and requires at least one field); `description: null` clears it.
 */
export interface UpdateTrackerInput {
  title?: string
  description?: string | null
  startDate?: string
}

export interface TrackerResponse {
  tracker: Tracker
}

export interface TrackersResponse {
  trackers: Array<Tracker>
}

export interface CompletedDaysResponse {
  /** Sorted ascending `YYYY-MM-DD`. */
  dates: Array<string>
  total: number
  /** Explicitly bad Abstinence dates, sorted ascending. */
  badDates: Array<string>
  badTotal: number
}

export interface MarkCompletedDayInput {
  trackerId: string
  date: string
  replaceBad?: true
}

export interface MarkBadDayInput {
  trackerId: string
  date: string
}

export interface UnmarkBadDayInput {
  trackerId: string
  date: string
}

export interface UnmarkCompletedDayInput {
  trackerId: string
  date: string
}

export interface CheckAllCompletedDaysResponse {
  added: number
  total: number
  preservedBad: number
}

export interface ClearAllCompletedDaysResponse {
  cleared: number
  total: number
  preservedBad: number
}

/** Landmark with server-computed progress against its tracker's current count. */
export interface Landmark {
  id: string
  trackerId: string
  title: string | null
  targetCount: number
  celebrationDescription: string
  currentCount: number
  remaining: number
  reached: boolean
  celebrated: boolean
  celebratedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateLandmarkInput {
  title?: string
  targetCount: number
  celebrationDescription: string
}

export interface UpdateLandmarkInput {
  title?: string | null
  targetCount?: number
  celebrationDescription?: string
  celebrated?: boolean
}

export interface LandmarkResponse {
  landmark: Landmark
}

export interface LandmarksResponse {
  landmarks: Array<Landmark>
}

export type TrackerErrorCode =
  | 'VALIDATION_ERROR'
  | 'TRACKER_NOT_FOUND'
  | 'COMPLETION_NOT_FOUND'
  | 'LANDMARK_NOT_FOUND'
  | 'DATE_IN_FUTURE'
  | 'DATE_BEFORE_START'
  | 'DATE_NOT_COMPLETABLE_YET'
  | 'START_DATE_AFTER_COMPLETION'
  | 'START_DATE_AFTER_RECORDED_DAY'
  | 'BACKFILL_RANGE_TOO_LARGE'
  | 'DUPLICATE_COMPLETION'
  | 'BAD_DAY_NOT_ALLOWED'
  | 'BAD_DAY_CONFIRMATION_REQUIRED'
  | 'BAD_DAY_NOT_FOUND'
  | 'DUPLICATE_BAD_DAY'
  | 'DUPLICATE_LANDMARK_TARGET'
  | 'LANDMARK_NOT_REACHED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR'
