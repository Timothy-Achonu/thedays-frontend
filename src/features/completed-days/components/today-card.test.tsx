import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TodayCard } from './today-card'
import type { Tracker } from '@/types/trackers'

const { markGood, unmarkGood, markBad, unmarkBad } = vi.hoisted(() => ({
  markGood: vi.fn(),
  unmarkGood: vi.fn(),
  markBad: vi.fn(),
  unmarkBad: vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
  useIsMutating: () => 0,
}))

vi.mock('@/lib/app/trackers', () => ({
  COMPLETED_DAY_MUTATION_KEY: ['completed-day-mutations'],
  useMarkCompletedDayMutation: () => ({ isPending: false, mutate: markGood }),
  useUnmarkCompletedDayMutation: () => ({
    isPending: false,
    mutate: unmarkGood,
  }),
  useMarkBadDayMutation: () => ({ isPending: false, mutate: markBad }),
  useUnmarkBadDayMutation: () => ({ isPending: false, mutate: unmarkBad }),
}))

const tracker: Tracker = {
  id: 'tracker_1',
  title: 'Days without soda',
  description: null,
  startDate: '2026-08-23',
  completionMode: 'abstinence',
  createdAt: '2026-08-23T00:00:00.000Z',
  updatedAt: '2026-08-23T00:00:00.000Z',
  daysCount: 0,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TodayCard Abstinence day editor', () => {
  it('keeps today discreet and allows a setback while On track is disabled', async () => {
    const user = userEvent.setup()
    renderCard(new Set())

    expect(screen.getByText('In progress')).toBeInTheDocument()
    expect(screen.queryByText('Setback')).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: /open .*24.* entry, in progress/i,
      }),
    )

    expect(screen.getByRole('button', { name: /^On track/ })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /^Setback/ }))

    expect(markBad).toHaveBeenCalledWith(
      { trackerId: 'tracker_1', date: '2026-08-24' },
      expect.any(Object),
    )
  })

  it('confirms before clearing a setback entry', async () => {
    const user = userEvent.setup()
    renderCard(new Set(['2026-08-24']))

    await user.click(
      screen.getByRole('button', {
        name: /open .*24.* entry, setback recorded/i,
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Clear entry' }))
    expect(
      screen.getByRole('dialog', { name: 'Clear this entry?' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear entry' }))
    expect(unmarkBad).toHaveBeenCalledWith(
      { trackerId: 'tracker_1', date: '2026-08-24' },
      expect.any(Object),
    )
  })

  it('confirms and sends replaceBad when a setback becomes on track', async () => {
    const user = userEvent.setup()
    renderCard(new Set(['2026-08-23']))

    await user.click(
      screen.getByRole('button', {
        name: /open .*23.* entry, setback recorded/i,
      }),
    )
    await user.click(screen.getByRole('button', { name: /^On track/ }))
    expect(
      screen.getByRole('dialog', { name: 'Change this entry?' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change to on track' }))
    expect(markGood).toHaveBeenCalledWith(
      {
        trackerId: 'tracker_1',
        date: '2026-08-23',
        replaceBad: true,
      },
      expect.any(Object),
    )
  })
})

function renderCard(badDates: ReadonlySet<string>) {
  return render(
    <TodayCard
      tracker={tracker}
      completedDates={new Set()}
      badDates={badDates}
      today="2026-08-24"
      onError={vi.fn()}
    />,
  )
}
