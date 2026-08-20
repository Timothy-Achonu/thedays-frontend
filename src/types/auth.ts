import type { User } from '@/lib/common/models'

export interface LoginInput {
  email: string
  password: string
}

export interface GoogleAuthInput {
  idToken: string
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

export interface RegisterResponse {
  email: string
  requiresVerification: true
}

export interface VerifyEmailInput {
  email: string
  code: string
}

export interface ResendVerificationInput {
  email: string
}

export interface ApiErrorDetails {
  formErrors?: Array<string>
  fieldErrors?: Record<string, Array<string>>
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
  | 'USE_GOOGLE_SIGN_IN'
  | 'INVALID_GOOGLE_TOKEN'
  | 'USERNAME_TAKEN'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'EMAIL_NOT_VERIFIED'
  | 'EMAIL_DELIVERY_FAILED'
  | 'INVALID_OR_EXPIRED_CODE'
  | 'REGISTRATION_CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR'

export function isApiError(
  error: unknown,
): error is { response: { data: ApiError } } {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return false
  }

  const { response } = error
  if (
    typeof response !== 'object' ||
    response === null ||
    !('data' in response)
  ) {
    return false
  }

  const { data } = response
  return typeof data === 'object' && data !== null && 'error' in data
}
