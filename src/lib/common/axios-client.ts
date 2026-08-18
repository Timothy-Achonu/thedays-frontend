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
      const skipRedirect = error.config?.fetcherOptions?.skipAuthRedirect
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
