import { redirect } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import type { QueryClient } from '@tanstack/react-query'
import {
  AUTH_USER_QUERY_KEY,
  currentUserQueryOptions,
} from '@/lib/app/auth/queries'
import { ROUTES } from '@/lib/constants/routes'
import { HttpStatus } from '@/lib/utils'
import { getSessionState, markSessionSignedOut } from '@/lib/auth/session-state'

export function isUnauthorizedError(error: unknown): boolean {
  return (
    isAxiosError(error) && error.response?.status === HttpStatus.UNAUTHORIZED
  )
}

export function requireGuest(): void {
  if (getSessionState() === 'authenticated') {
    throw redirect({ to: ROUTES.dashboard })
  }
}

export function requireAuth(queryClient: QueryClient): void {
  if (getSessionState() !== 'authenticated') {
    throw redirect({ to: ROUTES.login })
  }

  void queryClient.ensureQueryData(currentUserQueryOptions).catch((error) => {
    if (isUnauthorizedError(error)) {
      markSessionSignedOut()
      queryClient.removeQueries({ queryKey: AUTH_USER_QUERY_KEY })

      if (typeof window !== 'undefined') {
        window.location.replace(`${ROUTES.login}?redirect_reason=unauthorized`)
      }
    }
  })
}
