import axios, { isAxiosError } from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { HttpStatus } from '@/lib/utils'

export type FetcherOptions = {
  skipAuthRedirect?: boolean
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    fetcherOptions?: FetcherOptions
  }
}

const UNAUTHENTICATED_AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/resend-verification',
] as const

function requestPathname(url: string | undefined): string | undefined {
  if (!url) return undefined

  try {
    return url.startsWith('http') ? new URL(url).pathname : url.split('?')[0]
  } catch {
    return url.split('?')[0]
  }
}

function isUnauthenticatedAuthRequest(url: string | undefined): boolean {
  const pathname = requestPathname(url)
  if (!pathname) return false

  return UNAUTHENTICATED_AUTH_PATHS.some(
    (authPath) => pathname === authPath || pathname.endsWith(authPath),
  )
}

export const axiosClient = axios.create({
  withCredentials: true,
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      isAxiosError(error) &&
      error.response?.status === HttpStatus.UNAUTHORIZED
    ) {
      const skipRedirect =
        error.config?.fetcherOptions?.skipAuthRedirect ||
        isUnauthenticatedAuthRequest(error.config?.url)
      if (!skipRedirect && typeof window !== 'undefined') {
        window.location.href = '/login?redirect_reason=unauthorized'
      }
    }
    return Promise.reject(error)
  },
)

export type AxiosFetcherConfig = Omit<AxiosRequestConfig, 'headers' | 'url'> & {
  headers?: Record<string, string | undefined>
  fetcherOptions?: FetcherOptions
}
