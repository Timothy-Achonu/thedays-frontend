import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DayList } from './day-list'
import type { Tracker } from '@/types/trackers'

const tracker: Tracker = {
  id: 'tracker_1',
  title: 'Test',
  description: null,
  startDate: '2026-08-22',
  completionMode: 'practice',
  createdAt: '2026-08-22T00:00:00Z',
  updatedAt: '2026-08-22T00:00:00Z',
  daysCount: 1,
}

function renderDayList(
  overrides: Partial<Tracker>,
  completed: ReadonlySet<string>,
  today = '2026-08-24',
) {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <DayList
        tracker={{ ...tracker, ...overrides }}
        completedDates={completed}
        today={today}
        onError={vi.fn()}
      />
    </QueryClientProvider>,
  )
}

describe('DayList accessible controls', () => {
  it('names incomplete, completed, and unavailable days by their actual action', () => {
    renderDayList({}, new Set(['2026-08-23']))
    expect(screen.getByRole('checkbox', { name: /^Mark .*24.* as completed$/i })).toBeEnabled()
    expect(screen.getByRole('checkbox', { name: /^Unmark .*23.* as completed$/i })).toBeEnabled()

    renderDayList({ completionMode: 'abstinence', startDate: '2026-08-24' }, new Set())
    expect(screen.getByRole('checkbox', { name: /unavailable until the day ends/i })).toBeDisabled()
  })

  it('renders only the visible batch for a very old tracker', () => {
    renderDayList({ startDate: '1000-01-01' }, new Set())
    expect(screen.getAllByRole('checkbox')).toHaveLength(30)
    expect(screen.getByText(/more/)).toBeInTheDocument()
  })

  it('decorates a closed month when every calendar day was completed', () => {
    renderDayList(
      { startDate: '2026-07-01' },
      new Set(
        Array.from({ length: 31 }, (_, index) => {
          const day = `${index + 1}`.padStart(2, '0')
          return `2026-07-${day}`
        }),
      ),
      '2026-08-01',
    )

    expect(screen.getByRole('img', { name: 'Perfect month' })).toBeInTheDocument()
    expect(screen.getByText('Perfect month')).toBeInTheDocument()
  })

  it('does not decorate a closed partial month', () => {
    renderDayList(
      { startDate: '2026-07-27' },
      new Set([
        '2026-07-27',
        '2026-07-28',
        '2026-07-29',
        '2026-07-30',
        '2026-07-31',
      ]),
      '2026-08-02',
    )

    expect(screen.queryByRole('img', { name: 'Perfect month' })).not.toBeInTheDocument()
    expect(screen.queryByText('Perfect month')).not.toBeInTheDocument()
  })
})
