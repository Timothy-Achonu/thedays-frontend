import { getBaseUrl } from '@/lib/common/getBaseUrl'
import { network } from '@/lib/common/network'

export async function logoutAndClearSession(callbackUrl = '/login') {
  if (typeof document === 'undefined') return

  try {
    await network.post<void>(`${getBaseUrl()}/auth/logout`, {
      fetcherOptions: { skipAuthRedirect: true },
    })
  } finally {
    if (callbackUrl) {
      window.location.href = callbackUrl
    }
  }
}

export function signOutSession(callbackUrl = '/login') {
  void logoutAndClearSession(callbackUrl)
}
