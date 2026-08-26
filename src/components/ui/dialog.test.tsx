import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppDialog } from './dialog'

function installMatchMedia(matchesSm: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('640px') ? matchesSm : false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
}

function renderDialog(onClose = vi.fn()) {
  return {
    onClose,
    ...render(
      <AppDialog
        open
        onClose={onClose}
        title="Add a landmark"
        description="A landmark is a target worth reaching."
        footer={<button type="button">Add landmark</button>}
      >
        <p>Celebration field</p>
      </AppDialog>,
    ),
  }
}

describe('AppDialog', () => {
  afterEach(() => {
    installMatchMedia(false)
  })

  it('renders a bottom sheet below the sm breakpoint', () => {
    installMatchMedia(false)
    renderDialog()

    expect(
      screen.getByRole('dialog', { name: 'Add a landmark' }),
    ).toBeInTheDocument()
    expect(document.querySelector('[data-vaul-drawer]')).not.toBeNull()
    expect(screen.getByText('Celebration field')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add landmark' }),
    ).toBeInTheDocument()
  })

  it('renders a centered modal at the sm breakpoint', () => {
    installMatchMedia(true)
    renderDialog()

    expect(
      screen.getByRole('dialog', { name: 'Add a landmark' }),
    ).toBeInTheDocument()
    expect(document.querySelector('[data-vaul-drawer]')).toBeNull()
    expect(screen.getByText('Celebration field')).toBeInTheDocument()
  })

  it('dismisses the bottom sheet from the overlay', async () => {
    installMatchMedia(false)
    const { onClose } = renderDialog()
    const overlay = document.querySelector('[data-vaul-overlay]')
    expect(overlay).not.toBeNull()
    await userEvent.click(overlay as Element)
    expect(onClose).toHaveBeenCalled()
  })
})
