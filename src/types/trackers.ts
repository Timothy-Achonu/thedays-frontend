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
}

export interface MarkCompletedDayInput {
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
}

export interface ClearAllCompletedDaysResponse {
  cleared: number
  total: number
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
  | 'BACKFILL_RANGE_TOO_LARGE'
  | 'DUPLICATE_COMPLETION'
  | 'DUPLICATE_LANDMARK_TARGET'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR'
