import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { DashboardSummaryResponse } from '@/types/dashboard'
import { DashboardPage } from '@/components/dashboard-page'

const { currentUserQuery, summaryQuery } = vi.hoisted(() => ({
  currentUserQuery: {
    data: {
      username: 'daily_runner',
      timezone: 'Africa/Lagos',
    },
  },
  summaryQuery: {
    data: undefined as DashboardSummaryResponse | undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (options: unknown) => options,
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

vi.mock('@/lib/app/auth', () => ({
  useCurrentUserQuery: () => currentUserQuery,
}))

vi.mock('@/lib/app/dashboard', () => ({
  useDashboardSummaryQuery: () => summaryQuery,
}))

vi.mock('@/components/timezone-mismatch-banner', () => ({
  TimezoneMismatchBanner: () => null,
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    summaryQuery.isLoading = false
    summaryQuery.isError = false
    summaryQuery.refetch.mockClear()
  })

  it('greets the user and renders aggregate progress with transparent ties', () => {
    summaryQuery.data = {
      stats: {
        trackerCount: 3,
        totalCompletedDays: 28,
        highestTracker: {
          id: 'tracker_1',
          title: 'Running',
          daysCount: 12,
          tiedWithCount: 1,
        },
        closestLandmark: {
          id: 'landmark_1',
          title: 'Twenty runs',
          targetCount: 20,
          currentCount: 12,
          remaining: 8,
          tiedWithCount: 1,
          tracker: { id: 'tracker_1', title: 'Running' },
        },
      },
    }

    render(<DashboardPage />)

    expect(
      screen.getByRole('heading', { name: 'Hi daily_runner' }),
    ).toBeInTheDocument()
    expect(screen.getByText('28')).toBeInTheDocument()
    expect(screen.getByText('Tied with 1 other tracker')).toBeInTheDocument()
    expect(screen.getByText('Twenty runs')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('renders honest neutral states without trackers or upcoming landmarks', () => {
    summaryQuery.data = {
      stats: {
        trackerCount: 0,
        totalCompletedDays: 0,
        highestTracker: null,
        closestLandmark: null,
      },
    }

    render(<DashboardPage />)

    expect(screen.getByText('No progress yet')).toBeInTheDocument()
    expect(screen.getByText('No upcoming landmark')).toBeInTheDocument()
  })

  it('keeps loading separate from an empty summary', () => {
    summaryQuery.data = undefined
    summaryQuery.isLoading = true

    render(<DashboardPage />)

    expect(
      screen.getByRole('status', { name: 'Loading dashboard statistics' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('No progress yet')).not.toBeInTheDocument()
  })
})
