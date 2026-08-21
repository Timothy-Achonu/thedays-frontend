import { isAxiosError } from 'axios'
import { axiosClient } from '@/lib/common/axios-client'
import { getBaseUrl } from '@/lib/common/getBaseUrl'
import { markSessionSignedOut } from '@/lib/auth/session-state'
import { HttpStatus } from '@/lib/utils'

export async function logoutAndClearSession(callbackUrl = '/login') {
  if (typeof document === 'undefined') return

  try {
    await axiosClient.post(`${getBaseUrl()}/auth/logout`, undefined, {
      fetcherOptions: { skipAuthRedirect: true },
    })
  } catch (error) {
    if (
      !isAxiosError(error) ||
      error.response?.status !== HttpStatus.UNAUTHORIZED
    ) {
      throw error
    }
  }

  markSessionSignedOut()
  if (callbackUrl) window.location.href = callbackUrl
}

export function signOutSession(callbackUrl = '/login') {
  void logoutAndClearSession(callbackUrl).catch(() => undefined)
}
