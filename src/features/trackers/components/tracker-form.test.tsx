import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TrackerForm } from './tracker-form'

describe('TrackerForm completion mode', () => {
  it('uses one native radio group with arrow-key navigation', async () => {
    const user = userEvent.setup()
    render(
      <TrackerForm
        mode="create"
        today="2026-08-24"
        submitLabel="Create"
        pendingLabel="Creating"
        isPending={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    const practice = screen.getByRole('radio', { name: /practice/i })
    const abstinence = screen.getByRole('radio', { name: /abstinence/i })
    expect(practice).toHaveAttribute('name', 'completion-mode')
    expect(abstinence).toHaveAttribute('name', 'completion-mode')

    await user.click(practice)
    await user.keyboard('{ArrowRight}')
    expect(abstinence).toBeChecked()
  })
})
