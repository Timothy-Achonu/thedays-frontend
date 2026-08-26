import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { toastLandmarkReached } from './landmark-reached-toast'
import { ToastViewport } from '@/components/ui/toast-viewport'
import * as notify from '@/lib/utils/notify'

afterEach(() => {
  act(() => {
    notify.dismissAll()
  })
  cleanup()
})

describe('toastLandmarkReached', () => {
  it('shows why the landmark was reached and can be dismissed', async () => {
    const user = userEvent.setup()
    render(<ToastViewport />)

    act(() => {
      toastLandmarkReached([
        {
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
    render(<ToastViewport />)

    act(() => {
      toastLandmarkReached([
        {
          title: 'Dinner',
          targetCount: 10,
          celebrationDescription: 'Celebrate with dinner.',
        },
        {
          title: null,
          targetCount: 50,
          celebrationDescription: 'Buy new shoes.',
        },
      ])
    })

    expect(await screen.findByText('2 landmarks reached')).toBeInTheDocument()
    expect(screen.getByText(/Celebrate with dinner/)).toBeInTheDocument()
    expect(screen.getByText(/Buy new shoes/)).toBeInTheDocument()
  })
})
