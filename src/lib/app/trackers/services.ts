import type {
  CheckAllCompletedDaysResponse,
  ClearAllCompletedDaysResponse,
  CompletedDaysResponse,
  CreateLandmarkInput,
  CreateTrackerInput,
  LandmarkResponse,
  LandmarksResponse,
  MarkCompletedDayInput,
  TrackerResponse,
  TrackersResponse,
  UnmarkCompletedDayInput,
  UpdateLandmarkInput,
  UpdateTrackerInput,
} from '@/types/trackers'
import { axiosClient } from '@/lib/common/axios-client'
import { getBaseUrl } from '@/lib/common/getBaseUrl'

function trackersUrl(): string {
  return `${getBaseUrl()}/trackers`
}

function trackerUrl(trackerId: string): string {
  return `${getBaseUrl()}/trackers/${trackerId}`
}

export async function listTrackers(
  signal?: AbortSignal,
): Promise<TrackersResponse> {
  const response = await axiosClient.get<TrackersResponse>(trackersUrl(), {
    signal,
  })
  return response.data
}

export async function getTracker(
  trackerId: string,
  signal?: AbortSignal,
): Promise<TrackerResponse> {
  const response = await axiosClient.get<TrackerResponse>(
    trackerUrl(trackerId),
    { signal },
  )
  return response.data
}

export async function createTracker(
  input: CreateTrackerInput,
): Promise<TrackerResponse> {
  const response = await axiosClient.post<TrackerResponse>(trackersUrl(), input)
  return response.data
}

export async function updateTracker(
  trackerId: string,
  input: UpdateTrackerInput,
): Promise<TrackerResponse> {
  const response = await axiosClient.patch<TrackerResponse>(
    trackerUrl(trackerId),
    input,
  )
  return response.data
}

export async function deleteTracker(trackerId: string): Promise<void> {
  await axiosClient.delete(trackerUrl(trackerId))
}

export async function listCompletedDays(
  trackerId: string,
  signal?: AbortSignal,
): Promise<CompletedDaysResponse> {
  const response = await axiosClient.get<CompletedDaysResponse>(
    `${trackerUrl(trackerId)}/completed-days`,
    { signal },
  )
  return response.data
}

export async function markCompletedDay(
  input: MarkCompletedDayInput,
): Promise<void> {
  await axiosClient.post(`${trackerUrl(input.trackerId)}/completed-days`, {
    date: input.date,
  })
}

export async function unmarkCompletedDay(
  input: UnmarkCompletedDayInput,
): Promise<void> {
  await axiosClient.delete(
    `${trackerUrl(input.trackerId)}/completed-days/${input.date}`,
  )
}

export async function checkAllCompletedDays(
  trackerId: string,
): Promise<CheckAllCompletedDaysResponse> {
  const response = await axiosClient.post<CheckAllCompletedDaysResponse>(
    `${trackerUrl(trackerId)}/completed-days/check-all`,
  )
  return response.data
}

export async function clearAllCompletedDays(
  trackerId: string,
): Promise<ClearAllCompletedDaysResponse> {
  const response = await axiosClient.delete<ClearAllCompletedDaysResponse>(
    `${trackerUrl(trackerId)}/completed-days`,
  )
  return response.data
}

export async function listLandmarks(
  trackerId: string,
  signal?: AbortSignal,
): Promise<LandmarksResponse> {
  const response = await axiosClient.get<LandmarksResponse>(
    `${trackerUrl(trackerId)}/landmarks`,
    { signal },
  )
  return response.data
}

export async function createLandmark(
  trackerId: string,
  input: CreateLandmarkInput,
): Promise<LandmarkResponse> {
  const response = await axiosClient.post<LandmarkResponse>(
    `${trackerUrl(trackerId)}/landmarks`,
    input,
  )
  return response.data
}

export async function updateLandmark(
  trackerId: string,
  landmarkId: string,
  input: UpdateLandmarkInput,
): Promise<LandmarkResponse> {
  const response = await axiosClient.patch<LandmarkResponse>(
    `${trackerUrl(trackerId)}/landmarks/${landmarkId}`,
    input,
  )
  return response.data
}

export async function deleteLandmark(
  trackerId: string,
  landmarkId: string,
): Promise<void> {
  await axiosClient.delete(`${trackerUrl(trackerId)}/landmarks/${landmarkId}`)
}
