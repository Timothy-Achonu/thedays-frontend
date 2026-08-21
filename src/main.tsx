import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'
import { routeTree } from './routeTree.gen.ts'

import './styles.css'

const PRELOAD_RELOAD_STORAGE_KEY = 'thedays:last-preload-reload'
const PRELOAD_RELOAD_WINDOW_MS = 60_000

window.addEventListener('vite:preloadError', (event) => {
  const failureKey = event.payload.message

  try {
    const storedReload = window.sessionStorage.getItem(
      PRELOAD_RELOAD_STORAGE_KEY,
    )
    const previousReload = storedReload
      ? (JSON.parse(storedReload) as {
          failureKey?: string
          timestamp?: number
        })
      : null
    const recentlyReloadedForFailure =
      previousReload?.failureKey === failureKey &&
      typeof previousReload.timestamp === 'number' &&
      Date.now() - previousReload.timestamp < PRELOAD_RELOAD_WINDOW_MS

    if (recentlyReloadedForFailure) return

    window.sessionStorage.setItem(
      PRELOAD_RELOAD_STORAGE_KEY,
      JSON.stringify({ failureKey, timestamp: Date.now() }),
    )
  } catch {
    // Without session storage, let the route error render instead of risking a loop.
    return
  }

  event.preventDefault()
  window.location.reload()
})

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <RouterProvider router={router} />
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  )
}
