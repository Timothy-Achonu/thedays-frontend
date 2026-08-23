import { redirect } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { ROUTES } from '@/lib/constants/routes'
import { HttpStatus } from '@/lib/utils'
import { getSessionState } from '@/lib/auth/session-state'

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

export function requireAuth(): void {
  if (getSessionState() !== 'authenticated') {
    throw redirect({ to: ROUTES.login })
  }
}
