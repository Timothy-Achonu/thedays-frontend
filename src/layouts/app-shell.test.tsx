import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppShell } from './app-shell'
import type { ReactNode } from 'react'
import type { User } from '@/lib/common/models'

const logoutMutation = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
}))

vi.mock('@/lib/app/auth', () => ({
  useLogoutMutation: () => logoutMutation,
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

const user: User = {
  id: 'user_1',
  username: 'daily_runner',
  email: 'runner@example.com',
  timezone: 'Africa/Lagos',
  canChangeUsername: true,
  createdAt: '2026-08-24T00:00:00Z',
  updatedAt: '2026-08-24T00:00:00Z',
}

function renderAppShell() {
  return render(<AppShell user={user}>Dashboard content</AppShell>)
}

describe('AppShell responsive account menu', () => {
  beforeEach(() => {
    logoutMutation.mutate.mockClear()
    logoutMutation.isPending = false
    logoutMutation.isError = false
  })

  it('uses destination-based navigation for dashboard, trackers, and settings', () => {
    renderAppShell()

    expect(screen.getAllByRole('link', { name: 'Dashboard' })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'Trackers' })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'Settings' })).toHaveLength(2)
    expect(
      screen.queryByRole('link', { name: 'New Tracker' }),
    ).not.toBeInTheDocument()
  })

  it('opens from the profile avatar and logs out directly', async () => {
    const browserUser = userEvent.setup()
    renderAppShell()
    const profileButton = screen.getByRole('button', {
      name: `Open account menu for ${user.username}`,
    })

    expect(profileButton.closest('.border-b')).toHaveClass('relative', 'z-40')

    await browserUser.click(profileButton)

    const accountMenu = screen.getByRole('dialog', { name: 'Account menu' })
    expect(within(accountMenu).getByText(user.username)).toBeInTheDocument()

    await browserUser.click(
      within(accountMenu).getByRole('button', { name: 'Log out' }),
    )
    expect(logoutMutation.mutate).toHaveBeenCalledOnce()
  })

  it('shows pending and failure states without hiding the menu', async () => {
    const browserUser = userEvent.setup()
    const view = renderAppShell()

    await browserUser.click(
      screen.getByRole('button', { name: /open account menu/i }),
    )

    logoutMutation.isPending = true
    view.rerender(<AppShell user={user}>Dashboard content</AppShell>)
    const accountMenu = screen.getByRole('dialog', { name: 'Account menu' })
    expect(
      within(accountMenu).getByRole('button', { name: 'Signing out…' }),
    ).toBeDisabled()

    logoutMutation.isPending = false
    logoutMutation.isError = true
    view.rerender(<AppShell user={user}>Dashboard content</AppShell>)
    expect(within(accountMenu).getByRole('alert')).toHaveTextContent(
      "Couldn't log out. Try again.",
    )
    expect(
      within(accountMenu).getByRole('button', { name: 'Log out' }),
    ).toBeEnabled()
  })

  it('closes with Escape and restores focus to the profile avatar', async () => {
    const browserUser = userEvent.setup()
    renderAppShell()
    const profileButton = screen.getByRole('button', {
      name: /open account menu/i,
    })

    await browserUser.click(profileButton)
    expect(
      screen.getByRole('dialog', { name: 'Account menu' }),
    ).toBeInTheDocument()

    await browserUser.keyboard('{Escape}')
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Account menu' }),
      ).not.toBeInTheDocument()
    })
    expect(profileButton).toHaveFocus()
  })
})
