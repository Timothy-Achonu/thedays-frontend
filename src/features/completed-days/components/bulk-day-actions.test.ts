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
      '2026-08-24',
    )
    expect(progress).toEqual({
      lastEligibleBoundary: '2026-08-23',
      eligibleTotal: 23,
      completedEligibleCount: 2,
    })
  })
})

describe('historical backfill guidance', () => {
  it('explains the mark-all-then-review workflow on the card and dialog', async () => {
    const user = userEvent.setup()
    renderBulkDayActions()

    expect(
      screen.getByText(
        'Save time when most days qualify: mark them all, then uncheck any missed days below.',
      ),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Mark all eligible dates' }),
    )

    expect(
      screen.getByText(
        'This marks every currently unchecked eligible date as completed.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /review Day history and uncheck any days you missed/i,
      ),
    ).toBeInTheDocument()
  })

  it.each([
    {
      result: { added: 20, total: 22 },
      feedback:
        '20 days checked. 22 days completed in total. Review Day history and uncheck any missed days.',
    },
    {
      result: { added: 0, total: 22 },
      feedback:
        'All 22 eligible days are already checked. Review Day history and uncheck any missed days.',
    },
  ])('includes the review reminder after checking days', async ({
    result,
    feedback,
  }) => {
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
    await user.click(screen.getByRole('button', { name: 'Check 20 days' }))

    expect(screen.getByRole('status')).toHaveTextContent(feedback)
  })
})

function renderBulkDayActions() {
  render(
    createElement(BulkDayActions, {
      tracker,
      completedDates: new Set(['2026-08-03', '2026-08-04']),
      today: '2026-08-24',
    }),
  )
}
