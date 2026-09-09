import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StreaksPanel } from './streaks-panel'
import type { Tracker } from '@/types/trackers'

const tracker: Tracker = {
  id: 'tracker_1',
  title: 'Test',
  description: null,
  startDate: '2026-08-01',
  completionMode: 'practice',
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
  daysCount: 5,
}

describe('StreaksPanel', () => {
  it('renders the current streak and historical runs', () => {
    render(
      <StreaksPanel
        tracker={tracker}
        completedDates={
          new Set([
            '2026-08-01',
            '2026-08-02',
            '2026-08-04',
            '2026-08-05',
            '2026-08-06',
          ])
        }
        today="2026-08-06"
      />,
    )

    expect(screen.getByText('Current')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(
      screen.getByText(/Aug 4, 2026 through Aug 6, 2026/i),
    ).toBeInTheDocument()
    expect(screen.getByText('Aug 1, 2026')).toBeInTheDocument()
    expect(screen.getByText('Aug 2, 2026')).toBeInTheDocument()
  })

  it('renders an empty state when there are no runs of two or more days', () => {
    render(
      <StreaksPanel
        tracker={tracker}
        completedDates={new Set(['2026-08-01', '2026-08-03'])}
        today="2026-08-06"
      />,
    )

    expect(screen.getByText(/No active streak right now/i)).toBeInTheDocument()
    expect(screen.getByText(/No streaks of 2\+ days yet/i)).toBeInTheDocument()
  })
})
