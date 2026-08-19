import { redirect } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import type { QueryClient } from '@tanstack/react-query'
import type { User } from '@/lib/common/models'
import { currentUserQueryOptions } from '@/lib/app/auth/queries'
import { ROUTES } from '@/lib/constants/routes'
import { HttpStatus } from '@/lib/utils'

function isUnauthorized(error: unknown): boolean {
  return (
    isAxiosError(error) && error.response?.status === HttpStatus.UNAUTHORIZED
  )
}

export async function requireGuest(queryClient: QueryClient): Promise<void> {
  try {
    await queryClient.ensureQueryData(currentUserQueryOptions)
  } catch (error) {
    if (isUnauthorized(error)) return
    throw error
  }

  throw redirect({ to: ROUTES.dashboard })
}

export async function requireAuth(queryClient: QueryClient): Promise<User> {
  try {
    return await queryClient.ensureQueryData(currentUserQueryOptions)
  } catch (error) {
    if (isUnauthorized(error)) {
      throw redirect({ to: ROUTES.login })
    }
    throw error
  }
}
