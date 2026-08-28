import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LandmarkCard } from './landmark-card'
import type { Landmark } from '@/types/trackers'

function landmark(overrides: Partial<Landmark> = {}): Landmark {
  return {
    id: 'landmark_1',
    trackerId: 'tracker_1',
    title: 'The Big 50',
    targetCount: 50,
    celebrationDescription: 'Buy a new pair of running shoes.',
    currentCount: 20,
    remaining: 30,
    reached: false,
    celebrated: false,
    celebratedAt: null,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  }
}

const actions = {
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onCelebrate: vi.fn(),
  onUndoCelebrate: vi.fn(),
}

describe('LandmarkCard', () => {
  it('shows remaining days for an upcoming landmark', () => {
    render(<LandmarkCard landmark={landmark()} {...actions} />)

    expect(screen.getByText('30 days remaining')).toBeInTheDocument()
    expect(
      screen.getByText('Buy a new pair of running shoes.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /mark the .* celebration as done/i }),
    ).not.toBeInTheDocument()
  })

  it('offers a visible celebrate action once the landmark is reached', () => {
    render(
      <LandmarkCard
        landmark={landmark({
          currentCount: 50,
          remaining: 0,
          reached: true,
        })}
        {...actions}
      />,
    )

    expect(screen.getByText(/reached — celebrate/i)).toBeInTheDocument()
    expect(
      screen.getByText('Buy a new pair of running shoes.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Mark the 50-day celebration as done',
      }),
    ).toHaveTextContent('Mark as celebrated')
  })

  it('shows a settled celebrated state with undo', () => {
    render(
      <LandmarkCard
        landmark={landmark({
          currentCount: 50,
          remaining: 0,
          reached: true,
          celebrated: true,
          celebratedAt: '2026-08-20T12:00:00.000Z',
        })}
        {...actions}
      />,
    )

    expect(screen.getByText('Celebrated')).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Undo celebration for the 50-day landmark',
      }),
    ).toBeEnabled()
    expect(
      screen.queryByRole('button', { name: /mark the .* celebration as done/i }),
    ).not.toBeInTheDocument()
  })
})
