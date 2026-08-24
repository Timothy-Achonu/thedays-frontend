import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface AppDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  /** Controls the panel width. */
  size?: 'sm' | 'md' | 'lg'
  initialFocus?: ReactNode
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function AppDialog({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: AppDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-earth-950/55 backdrop-blur-sm transition-opacity duration-200 data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex items-end justify-center p-4 sm:items-center">
        <DialogPanel
          transition
          className={cn(
            'w-full rounded-3xl bg-white p-6 shadow-organic-lg',
            'transition duration-200 ease-out-expo data-[closed]:scale-95 data-[closed]:opacity-0',
            'sm:p-7',
            sizeStyles[size],
          )}
        >
          <div className="mb-1 h-1 w-14 rounded-full bg-gradient-to-r from-terracotta-400 via-sand-400 to-sage-500" />
          <DialogTitle className="mt-4 font-display text-2xl font-semibold text-earth-900">
            {title}
          </DialogTitle>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-earth-600">
              {description}
            </p>
          ) : null}
          <div className="mt-5">{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
