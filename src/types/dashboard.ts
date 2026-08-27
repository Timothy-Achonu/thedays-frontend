export interface DashboardSummaryResponse {
  stats: {
    trackerCount: number
    totalCompletedDays: number
    highestTracker: {
      id: string
      title: string
      daysCount: number
      tiedWithCount: number
    } | null
    closestLandmark: {
      id: string
      title: string | null
      targetCount: number
      currentCount: number
      remaining: number
      tiedWithCount: number
      tracker: {
        id: string
        title: string
      }
    } | null
  }
}
