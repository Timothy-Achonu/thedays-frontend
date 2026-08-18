import type { ResProps } from '@/lib/common/models'

export const parseResMsg = (
  message?: string | Array<string>,
  isSuccess?: boolean,
) => {
  const parsedMsg = Array.isArray(message)
    ? message[0]
    : typeof message === 'string'
      ? message
      : ''
  if (!parsedMsg && isSuccess) {
    return 'The request was successful!'
  }
  return (
    parsedMsg ||
    'Something failed. If the issue persists please contact support.'
  )
}

/** Use API envelope `message` when `error` is truthy; do not use React Query's thrown `error`. */
export function apiEnvelopeErrorMessage(
  envelope: ResProps<unknown> | null | undefined,
): string | undefined {
  return envelope?.error ? parseResMsg(envelope.message) : undefined
}

export const parseStatusCode = (
  status: number | undefined,
): { success: boolean } => {
  if (!status) {
    return { success: false }
  }
  return { success: status >= 200 && status < 300 }
}

function isResPropsEnvelope(res: object): boolean {
  return 'statusCode' in res || 'message' in res || 'error' in res
}

function isPaginatedPayload(res: object): boolean {
  const r = res as { data?: unknown; meta?: Record<string, unknown> | null }
  if (!('data' in r) || !('meta' in r)) return false
  const meta = r.meta
  if (typeof meta !== 'object' || meta === null) return false
  return 'total' in meta || 'nextCursor' in meta
}

export function normalizeResponse<T>(res: unknown): ResProps<T> {
  if (typeof res === 'string') {
    return {
      message: res,
    }
  }
  if (Array.isArray(res)) {
    return { data: res as T }
  }
  if (typeof res === 'object' && res !== null) {
    const obj = res as Record<string, unknown>
    if ('data' in obj && isResPropsEnvelope(obj)) {
      return res
    }
    if (isPaginatedPayload(obj)) {
      return { data: res as T }
    }
    const { message, error, statusCode, data: existingData, ...rest } = obj
    const result: ResProps<T> = {}
    if (message !== undefined) result.message = message as ResProps['message']
    if (error !== undefined) result.error = error
    if (statusCode !== undefined) result.statusCode = statusCode as number
    if (existingData !== undefined) {
      result.data = existingData as T
    } else if (Object.keys(rest).length > 0) {
      result.data = rest as T
    }
    return result
  }
  return {}
}

export function normalizeHeaders(
  h?: HeadersInit | Record<string, string | undefined>,
): Record<string, string | undefined> {
  if (!h) return {}

  if (h instanceof Headers) {
    const obj: Record<string, string> = {}
    h.forEach((v, k) => {
      obj[k] = v
    })
    return obj
  }

  if (Array.isArray(h)) {
    return Object.fromEntries(h)
  }

  return { ...h }
}

export enum HttpStatus {
  UNAUTHORIZED = 401,
}
