import { useSyncExternalStore } from 'react'

/**
 * Height in px currently occluded by the on-screen keyboard, or 0 when it is
 * closed. iOS Safari overlays the keyboard without resizing the layout viewport;
 * `visualViewport` shrinks on both iOS and Android, so the gap is the inset.
 */
export function useKeyboardInset() {
  const subscribe = (callback: () => void) => {
    const visualViewport = window.visualViewport
    if (!visualViewport) return () => undefined

    visualViewport.addEventListener('resize', callback)
    visualViewport.addEventListener('scroll', callback)
    return () => {
      visualViewport.removeEventListener('resize', callback)
      visualViewport.removeEventListener('scroll', callback)
    }
  }

  const getSnapshot = () => {
    const visualViewport = window.visualViewport
    if (!visualViewport) return 0
    return Math.max(
      0,
      Math.round(
        window.innerHeight - visualViewport.height - visualViewport.offsetTop,
      ),
    )
  }

  const getServerSnapshot = () => 0

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
