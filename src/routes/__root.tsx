import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import type { QueryClient } from '@tanstack/react-query'

import { GlobalError } from '@/components/global-error'
import { NotFound } from '@/components/not-found'

interface RouterContext {
  queryClient: QueryClient
}

function RootShell() {
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
