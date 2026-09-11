import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BulkDayActions, getEligibleProgress } from './bulk-day-actions'
import type { Tracker } from '@/types/trackers'

const { checkAllMutate, clearAllMutate } = vi.hoisted(() => ({
  checkAllMutate: vi.fn(),
  clearAllMutate: vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
  useIsMutating: () => 0,
}))

vi.mock('@/lib/app/trackers', () => ({
  COMPLETED_DAY_MUTATION_KEY: ['completed-day-mutations'],
  useCheckAllCompletedDaysMutation: () => ({
    isPending: false,
    mutate: checkAllMutate,
  }),
  useClearAllCompletedDaysMutation: () => ({
    isPending: false,
    mutate: clearAllMutate,
  }),
}))

const tracker: Tracker = {
  id: 'tracker-1',
  title: 'Test tracker',
  description: null,
  startDate: '2026-08-03',
  completionMode: 'practice',
  createdAt: '2026-08-03T00:00:00.000Z',
  updatedAt: '2026-08-03T00:00:00.000Z',
  daysCount: 2,
}

beforeEach(() => {
  checkAllMutate.mockReset()
  clearAllMutate.mockReset()
})

describe('historical backfill totals', () => {
  it('counts the range arithmetically and scans only stored completions', () => {
    const progress = getEligibleProgress(
      { completionMode: 'abstinence', startDate: '2026-08-01' },
      new Set(['2026-07-31', '2026-08-01', '2026-08-10', '2026-08-24']),
      new Set(['2026-08-05']),
      '2026-08-24',
    )
    expect(progress).toEqual({
      lastEligibleBoundary: '2026-08-23',
      eligibleTotal: 23,
      completedEligibleCount: 2,
      badEligibleCount: 1,
    })
  })
})

describe('historical backfill guidance', () => {
  it('explains the mark-all-then-review workflow on the card and dialog', async () => {
    const user = userEvent.setup()
    renderBulkDayActions()

    expect(
      screen.getByText(/Mark every unreviewed eligible day good at once/i),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Mark all eligible dates' }),
    )

    expect(
      screen.getByText(/preserves dates already marked bad/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Existing bad records are never overwritten/i),
    ).toBeInTheDocument()
  })

  it.each([
    {
      result: { added: 19, total: 21, preservedBad: 1 },
      feedback:
        '19 days marked good. 21 days completed in total. 1 day marked bad was preserved.',
    },
    {
      result: { added: 0, total: 2, preservedBad: 1 },
      feedback:
        'There were no unreviewed eligible days to mark good. 1 day marked bad was preserved.',
    },
  ])(
    'includes the review reminder after checking days',
    async ({ result, feedback }) => {
      const user = userEvent.setup()
      checkAllMutate.mockImplementationOnce(
        (
          _trackerId: string,
          options: { onSuccess: (value: typeof result) => void },
        ) => options.onSuccess(result),
      )
      renderBulkDayActions()

      await user.click(
        screen.getByRole('button', { name: 'Mark all eligible dates' }),
      )
      await user.click(screen.getByRole('button', { name: 'Check 19 days' }))

      expect(screen.getByRole('status')).toHaveTextContent(feedback)
    },
  )

  it('hides Abstinence bulk actions in a discreet history menu', async () => {
    const user = userEvent.setup()
    renderBulkDayActions({ completionMode: 'abstinence' })

    expect(
      screen.queryByRole('button', { name: 'Mark all eligible dates' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'History tools' }))
    await user.click(
      screen.getByRole('menuitem', {
        name: 'Mark unreviewed days on track',
      }),
    )

    expect(
      screen.getByRole('dialog', { name: 'Mark 18 days on track?' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Existing setback entries remain unchanged/i),
    ).toBeInTheDocument()
  })
})

function renderBulkDayActions(overrides: Partial<Tracker> = {}) {
  render(
    createElement(BulkDayActions, {
      tracker: { ...tracker, ...overrides },
      completedDates: new Set(['2026-08-03', '2026-08-04']),
      badDates: new Set(['2026-08-05']),
      today: '2026-08-24',
    }),
  )
}
