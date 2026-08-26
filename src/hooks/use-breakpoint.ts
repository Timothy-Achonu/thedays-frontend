import { useSyncExternalStore } from 'react'

const screens = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const

/** Whether a Tailwind min-width breakpoint currently matches. */
export function useBreakpoint(size: keyof typeof screens) {
  const query = `(min-width: ${screens[size]})`

  const subscribe = (callback: () => void) => {
    const media = window.matchMedia(query)
    media.addEventListener('change', callback)
    return () => media.removeEventListener('change', callback)
  }

  const getSnapshot = () => window.matchMedia(query).matches
  const getServerSnapshot = () => false

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
