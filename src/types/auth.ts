import type { User } from '@/lib/common/models'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  username: string
  email: string
  password: string
  timezone?: string
}

export interface AuthResponse {
  user: User
}

export interface ApiErrorDetails {
  formErrors?: string[]
  fieldErrors?: Record<string, string[]>
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: ApiErrorDetails
  }
}

export type AuthErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'USERNAME_TAKEN'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'REGISTRATION_CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR'

export function isApiError(error: unknown): error is { response: { data: ApiError } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: { data?: unknown } }).response !== null &&
    'data' in (error as { response: { data?: unknown } }).response &&
    typeof (error as { response: { data: unknown } }).response.data === 'object' &&
    (error as { response: { data: unknown } }).response.data !== null &&
    'error' in (error as { response: { data: { error?: unknown } } }).response.data
  )
}
