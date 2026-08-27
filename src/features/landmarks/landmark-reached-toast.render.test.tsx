import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { toastLandmarkReached } from './landmark-reached-toast'
import { ToastViewport } from '@/components/ui/toast-viewport'
import * as notify from '@/lib/utils/notify'

function renderToastHost() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastViewport />
    </QueryClientProvider>,
  )
}

afterEach(() => {
  act(() => {
    notify.dismissAll()
  })
  cleanup()
})

describe('toastLandmarkReached', () => {
  it('shows why the landmark was reached and can be dismissed', async () => {
    const user = userEvent.setup()
    renderToastHost()

    act(() => {
      toastLandmarkReached([
        {
          id: 'landmark_1',
          trackerId: 'tracker_1',
          title: 'Running shoes',
          targetCount: 50,
          celebrationDescription: 'Buy a new pair of running shoes.',
        },
      ])
    })

    expect(await screen.findByText('Landmark reached')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('Running shoes')).toBeInTheDocument()
    expect(
      screen.getByText('Buy a new pair of running shoes.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Mark the 50-day celebration as done',
      }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Dismiss notification' }),
    )

    await waitFor(() => {
      expect(
        document.querySelector('.Toastify__slide-exit--top-center'),
      ).not.toBeNull()
    })
  })

  it('uses one toast when several landmarks are reached together', async () => {
    renderToastHost()

    act(() => {
      toastLandmarkReached([
        {
          id: 'landmark_10',
          trackerId: 'tracker_1',
          title: 'Dinner',
          targetCount: 10,
          celebrationDescription: 'Celebrate with dinner.',
        },
        {
          id: 'landmark_50',
          trackerId: 'tracker_1',
          title: null,
          targetCount: 50,
          celebrationDescription: 'Buy new shoes.',
        },
      ])
    })

    expect(await screen.findByText('2 landmarks reached')).toBeInTheDocument()
    expect(screen.getByText(/Celebrate with dinner/)).toBeInTheDocument()
    expect(screen.getByText(/Buy new shoes/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Mark the 10-day celebration as done',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Mark the 50-day celebration as done',
      }),
    ).toBeInTheDocument()
  })
})
