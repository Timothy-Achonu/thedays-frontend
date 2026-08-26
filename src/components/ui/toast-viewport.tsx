import { useEffect, useState } from 'react'
import { Slide, ToastContainer, toast } from 'react-toastify'
import type { CloseButtonProps } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { cn } from '@/lib/utils/cn'

/**
 * Global toast host: top-center, one at a time, with a soft earth wash behind
 * the card so the moment reads as a celebration rather than chrome.
 */
export function ToastViewport() {
  const [hasToast, setHasToast] = useState(false)

  useEffect(() => {
    let openCount = 0
    return toast.onChange((payload) => {
      if (payload.status === 'added') openCount += 1
      if (payload.status === 'removed') openCount = Math.max(0, openCount - 1)
      setHasToast(openCount > 0)
    })
  }, [])

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none fixed inset-x-0 top-0 z-[9998] h-72 transition-opacity duration-500',
          'bg-[linear-gradient(to_bottom,rgb(45_36_25_/_0.14)_0%,transparent_72%)]',
          hasToast ? 'opacity-100' : 'opacity-0',
        )}
      />
      <ToastContainer
        position="top-center"
        autoClose={6_000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={1}
        icon={false}
        role="status"
        theme="light"
        transition={Slide}
        closeButton={ToastCloseButton}
        toastClassName={(context) =>
          cn(
            'thedays-toast',
            context?.type === 'success' && 'thedays-toast--success',
            context?.type === 'error' && 'thedays-toast--error',
            context?.type === 'warning' && 'thedays-toast--warning',
          )
        }
        style={{ zIndex: 9999 }}
      />
    </>
  )
}

function ToastCloseButton({ closeToast, ariaLabel }: CloseButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? 'Dismiss notification'}
      onClick={closeToast}
      className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full text-earth-400 transition-colors hover:bg-earth-100 hover:text-earth-700 focus-ring"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-4"
        aria-hidden="true"
      >
        <path
          d="M7.5 7.5 16.5 16.5M16.5 7.5 7.5 16.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}
