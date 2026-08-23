import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { AuthenticatedGate } from '@/components/auth/authenticated-gate'
import {
  AUTH_USER_QUERY_KEY,
  useCurrentUserQuery,
} from '@/lib/app/auth/queries'
import { isUnauthorizedError } from '@/lib/auth/guards'
import { markSessionSignedOut } from '@/lib/auth/session-state'
import { ROUTES } from '@/lib/constants/routes'
import { AppShell } from '@/components/app-shell'

export function AuthenticatedLayout() {
  const queryClient = useQueryClient()
  const currentUserQuery = useCurrentUserQuery()
  const isUnauthorized =
    currentUserQuery.isError && isUnauthorizedError(currentUserQuery.error)

  useEffect(() => {
    if (!isUnauthorized) return

    markSessionSignedOut()
    queryClient.removeQueries({ queryKey: AUTH_USER_QUERY_KEY })
    window.location.replace(`${ROUTES.login}?redirect_reason=unauthorized`)
  }, [isUnauthorized, queryClient])

  if (isUnauthorized) {
    return <AuthenticatedGate state="loading" />
  }

  if (currentUserQuery.data) {
    return (
      <AppShell user={currentUserQuery.data}>
        <Outlet />
      </AppShell>
    )
  }

  if (currentUserQuery.isFetching) {
    return <AuthenticatedGate state="loading" />
  }

  if (currentUserQuery.isError || currentUserQuery.fetchStatus === 'paused') {
    return (
      <AuthenticatedGate
        state="error"
        onRetry={() => void currentUserQuery.refetch()}
      />
    )
  }

  return <AuthenticatedGate state="loading" />
}
