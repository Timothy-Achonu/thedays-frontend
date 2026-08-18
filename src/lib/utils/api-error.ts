import { isAxiosError } from 'axios'
import type { ApiError, AuthErrorCode } from '@/types/auth'

export interface ParsedApiError {
  code: string
  message: string
  fieldErrors: Record<string, string[]>
  formErrors: string[]
}

export function parseApiError(error: unknown): ParsedApiError {
  const defaultError: ParsedApiError = {
    code: 'UNKNOWN_ERROR',
    message: 'Something went wrong. Please try again.',
    fieldErrors: {},
    formErrors: [],
  }

  if (!isAxiosError(error)) {
    return defaultError
  }

  const responseData = error.response?.data as ApiError | undefined

  if (!responseData?.error) {
    if (error.message === 'Network Error') {
      return {
        ...defaultError,
        code: 'NETWORK_ERROR',
        message: 'Unable to connect. Please check your internet connection.',
      }
    }
    return defaultError
  }

  const { code, message, details } = responseData.error

  return {
    code,
    message,
    fieldErrors: details?.fieldErrors ?? {},
    formErrors: details?.formErrors ?? [],
  }
}

export function getFieldError(
  error: ParsedApiError,
  field: string,
): string | undefined {
  const errors = error.fieldErrors[field]
  return errors?.[0]
}

export function hasFieldError(error: ParsedApiError, field: string): boolean {
  return Boolean(error.fieldErrors[field]?.length)
}

export function getFormError(error: ParsedApiError): string | undefined {
  return error.formErrors[0] || (Object.keys(error.fieldErrors).length === 0 ? error.message : undefined)
}

export function getAuthErrorMessage(code: AuthErrorCode | string): string {
  switch (code) {
    case 'INVALID_CREDENTIALS':
      return 'Invalid email or password. Please try again.'
    case 'USERNAME_TAKEN':
      return 'This username is already taken. Please choose another.'
    case 'EMAIL_ALREADY_REGISTERED':
      return 'An account with this email already exists. Try signing in instead.'
    case 'REGISTRATION_CONFLICT':
      return 'An account with these details already exists.'
    case 'RATE_LIMIT_EXCEEDED':
      return 'Too many attempts. Please wait a few minutes and try again.'
    case 'VALIDATION_ERROR':
      return 'Please check your input and try again.'
    case 'NETWORK_ERROR':
      return 'Unable to connect. Please check your internet connection.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

export function isRateLimitError(error: unknown): boolean {
  if (!isAxiosError(error)) return false
  const code = (error.response?.data as ApiError | undefined)?.error?.code
  return code === 'RATE_LIMIT_EXCEEDED'
}
