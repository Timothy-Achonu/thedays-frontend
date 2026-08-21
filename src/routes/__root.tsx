import { useEffect } from 'react'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import type { QueryClient } from '@tanstack/react-query'

import { GlobalError } from '@/components/global-error'
import { NotFound } from '@/components/not-found'
import { ROUTES } from '@/lib/constants/routes'
import { SESSION_STATE_STORAGE_KEY } from '@/lib/auth/session-state'

interface RouterContext {
  queryClient: QueryClient
}

function RootShell() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const handleSessionStateChange = (event: StorageEvent) => {
      if (
        event.key !== SESSION_STATE_STORAGE_KEY ||
        event.newValue !== 'signed-out'
      ) {
        return
      }

      queryClient.clear()

      const currentPath = window.location.pathname
      const isProtectedPath =
        currentPath === ROUTES.dashboard ||
        currentPath === ROUTES.settings ||
        currentPath === ROUTES.trackers.new ||
        currentPath.startsWith('/trackers/')

      if (isProtectedPath) {
        window.location.replace(`${ROUTES.login}?redirect_reason=signed_out`)
      }
    }

    window.addEventListener('storage', handleSessionStateChange)
    return () => window.removeEventListener('storage', handleSessionStateChange)
  }, [queryClient])

  return (
    <>
      <Outlet />
      {import.meta.env.DEV ? (
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: () => <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
      ) : null}
    </>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootShell,
  errorComponent: GlobalError,
  notFoundComponent: NotFound,
})
