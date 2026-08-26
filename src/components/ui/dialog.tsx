import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { useEffect, useRef, useState } from 'react'
import { Drawer } from 'vaul'
import type { ReactNode } from 'react'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { useKeyboardInset } from '@/hooks/use-keyboard-inset'
import { cn } from '@/lib/utils/cn'

type DialogPresentation = 'modal' | 'bottom-sheet'

interface AppDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  /** Controls the panel width on desktop. */
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

const titleClassName = 'font-display text-2xl font-semibold text-earth-900'
const descriptionClassName = 'mt-2 text-sm leading-6 text-earth-600'

export function AppDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: AppDialogProps) {
  const isDesktop = useBreakpoint('sm')
  const livePresentation: DialogPresentation = isDesktop
    ? 'modal'
    : 'bottom-sheet'
  const [openCycle, setOpenCycle] = useState({
    open,
    presentation: livePresentation,
  })
  const sheetContentRef = useRef<HTMLDivElement>(null)
  const keyboardInset = useKeyboardInset()

  if (openCycle.open !== open) {
    setOpenCycle({
      open,
      presentation: open ? livePresentation : openCycle.presentation,
    })
  }

  const presentation = open ? openCycle.presentation : livePresentation

  useEffect(() => {
    if (keyboardInset > 0) return
    const sheet = sheetContentRef.current
    if (!sheet) return
    sheet.style.height = ''
    sheet.style.bottom = ''
  }, [keyboardInset, open])

  const handleVaulOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose()
  }

  const chrome = (
    <DialogChrome
      title={title}
      description={description}
      presentation={presentation}
    />
  )
  const body =
    children != null ? (
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 sm:px-7">
        {children}
      </div>
    ) : null
  const footerBar = footer ? (
    <div className="shrink-0 border-t border-earth-100 px-6 py-4 sm:px-7">
      {footer}
    </div>
  ) : null

  if (presentation === 'bottom-sheet') {
    return (
      <Drawer.Root
        open={open}
        onOpenChange={handleVaulOpenChange}
        handleOnly
        repositionInputs={false}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-earth-950/55 backdrop-blur-sm" />
          <Drawer.Content
            ref={sheetContentRef}
            style={{
              willChange: 'auto',
              ...(keyboardInset > 0 ? { bottom: keyboardInset } : null),
            }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[96dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white pt-3 pb-[env(safe-area-inset-bottom)] shadow-organic-lg outline-none"
          >
            <Drawer.Handle className="mx-auto my-2 !bg-earth-300" />
            {chrome}
            {body}
            {footerBar}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} transition className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-earth-950/55 backdrop-blur-sm transition-opacity duration-200 data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-8">
        <DialogPanel
          transition
          className={cn(
            'flex max-h-[min(90vh,40rem)] w-full flex-col overflow-hidden rounded-3xl bg-white pt-6 shadow-organic-lg sm:pt-7',
            'transition duration-200 ease-out-expo data-[closed]:scale-95 data-[closed]:opacity-0',
            sizeStyles[size],
          )}
        >
          {chrome}
          {body}
          {footerBar}
        </DialogPanel>
      </div>
    </Dialog>
  )
}

function DialogChrome({
  title,
  description,
  presentation,
}: {
  title: string
  description?: string
  presentation: DialogPresentation
}) {
  const heading =
    presentation === 'bottom-sheet' ? (
      <Drawer.Title className={cn(titleClassName, 'mt-1')}>
        {title}
      </Drawer.Title>
    ) : (
      <DialogTitle className={cn(titleClassName, 'mt-4')}>{title}</DialogTitle>
    )

  return (
    <div
      className={cn(
        'shrink-0 px-6 sm:px-7',
        presentation === 'bottom-sheet' && 'pb-1',
      )}
    >
      {presentation === 'modal' ? (
        <div className="mb-1 h-1 w-14 rounded-full bg-gradient-to-r from-terracotta-400 via-sand-400 to-sage-500" />
      ) : null}
      {heading}
      {description ? (
        presentation === 'bottom-sheet' ? (
          <Drawer.Description className={descriptionClassName}>
            {description}
          </Drawer.Description>
        ) : (
          <p className={descriptionClassName}>{description}</p>
        )
      ) : null}
    </div>
  )
}
