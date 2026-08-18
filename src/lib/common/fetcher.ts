import { isAxiosError } from 'axios'
import {  axiosClient } from './axios-client'
import type {AxiosFetcherConfig} from './axios-client';
import type { PaginatedResProps, PaginationMeta, ResProps } from './models'
import {
  normalizeHeaders,
  normalizeResponse,
  parseResMsg,
  parseStatusCode,
} from '@/lib/utils'

export type { FetcherOptions } from './axios-client'

export const fetcher = async <T>(
  url: string,
  config: AxiosFetcherConfig = {},
): Promise<ResProps<T>> => {
  const { fetcherOptions, headers, ...rest } = config

  try {
    const res = await axiosClient.request({
      url,
      headers: normalizeHeaders(headers),
      fetcherOptions,
      ...rest,
    })

    const normalizedData = normalizeResponse<T>(res.data)
    const response: ResProps<T> = { ...normalizedData, statusCode: res.status }

    if (
      !parseStatusCode(response.statusCode).success &&
      response.error == null
    ) {
      response.error = parseResMsg(response.message)
    }

    return response
  } catch (err) {
    if (isAxiosError(err) && err.response) {
      const normalizedData = normalizeResponse<T>(err.response.data)
      const response: ResProps<T> = {
        ...normalizedData,
        statusCode: err.response.status,
      }

      if (
        !parseStatusCode(response.statusCode).success &&
        response.error == null
      ) {
        response.error = parseResMsg(response.message)
      }

      return response
    }

    return { error: err }
  }
}

export const post = <T>(url: string, config: AxiosFetcherConfig = {}) => {
  const headers = normalizeHeaders(config.headers)

  if (!('Content-Type' in headers)) {
    headers['Content-Type'] = 'application/json'
  }

  if (headers['Content-Type'] === undefined) {
    delete headers['Content-Type']
  }

  return fetcher<T>(url, {
    method: 'POST',
    ...config,
    headers,
  })
}

export const patch = <T>(url: string, config: AxiosFetcherConfig = {}) => {
  return fetcher<T>(url, {
    method: 'PATCH',
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  })
}

export const deleteReq = <T>(url: string, config: AxiosFetcherConfig = {}) => {
  return fetcher<T>(url, {
    method: 'DELETE',
    ...config,
    headers: {
      ...config.headers,
    },
  })
}

export const paginatedFetcher = <
  T,
  TMeta extends PaginationMeta = PaginationMeta,
>(
  route: string,
): Promise<ResProps<PaginatedResProps<T, TMeta>>> => {
  return fetcher<PaginatedResProps<T, TMeta>>(route)
}

export type PaginatedFetcherWithParamsOptions = {
  omitOffset?: boolean
}

export const paginatedFetcherWithParams = <
  T,
  TParams extends Record<string, unknown>,
  TMeta extends PaginationMeta = PaginationMeta,
>(
  route: string,
  params: TParams,
  options?: PaginatedFetcherWithParamsOptions,
): Promise<ResProps<PaginatedResProps<T, TMeta>>> => {
  const queryURL = new URL(route, window.location.origin)
  const omitOffset = options?.omitOffset ?? false

  const { offset = 0, limit = 11, ...rest } = params
  const restParams = rest as Record<string, unknown>

  if (!omitOffset) {
    queryURL.searchParams.set('offset', String(offset))
  }
  queryURL.searchParams.set('limit', String(limit))

  for (const key in restParams) {
    if (Object.prototype.hasOwnProperty.call(restParams, key)) {
      queryURL.searchParams.set(key, String(restParams[key]))
    }
  }

  return fetcher<PaginatedResProps<T, TMeta>>(
    `${queryURL.pathname}${queryURL.search}`,
  )
}

export const fetcherWithParams = <T, TParams extends Record<string, unknown>>(
  route: string,
  params: TParams,
): Promise<ResProps<T>> => {
  const queryURL = new URL(route, window.location.origin)

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      queryURL.searchParams.set(key, String(params[key]))
    }
  }

  return fetcher<T>(`${queryURL.pathname}${queryURL.search}`)
}
