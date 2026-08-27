import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AUTH_USER_QUERY_KEY } from './queries'
import type {
  AuthResponse,
  ForgotPasswordInput,
  ForgotPasswordResponse,
  GoogleAuthInput,
  LoginInput,
  RegisterInput,
  RegisterResponse,
  ResendVerificationInput,
  ResetPasswordInput,
  UpdateCurrentUserInput,
  VerifyEmailInput,
} from '@/types/auth'
import type { User } from '@/lib/common/models'
import { axiosClient } from '@/lib/common/axios-client'
import { getBaseUrl } from '@/lib/common/getBaseUrl'
import { ROUTES } from '@/lib/constants/routes'
import { isUnauthorizedError } from '@/lib/auth/guards'
import {
  markSessionAuthenticated,
  markSessionSignedOut,
} from '@/lib/auth/session-state'
import {
  dismissTimezoneMismatch,
  getDefaultTimezone,
} from '@/lib/utils/timezone'

export function verifyEmailPath(email: string, deliveryFailed = false) {
  return {
    to: '/verify-email' as const,
    search: deliveryFailed
      ? { email, deliveryFailed: true as const }
      : { email },
  }
}

export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    onMutate: () =>
      queryClient.cancelQueries({ queryKey: AUTH_USER_QUERY_KEY }),
    mutationFn: async (data: LoginInput): Promise<User> => {
      const response = await axiosClient.post<AuthResponse>(
        `${getBaseUrl()}/auth/login`,
        data,
        { fetcherOptions: { skipAuthRedirect: true } },
      )
      return response.data.user
    },
    onSuccess: (user) => {
      markSessionAuthenticated()
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, user)
    },
  })
}

export function useGoogleLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    onMutate: () =>
      queryClient.cancelQueries({ queryKey: AUTH_USER_QUERY_KEY }),
    mutationFn: async (data: GoogleAuthInput): Promise<User> => {
      const timezone = data.timezone ?? getDefaultTimezone()
      const response = await axiosClient.post<AuthResponse>(
        `${getBaseUrl()}/auth/google`,
        { ...data, timezone },
        { fetcherOptions: { skipAuthRedirect: true } },
      )
      return response.data.user
    },
    onSuccess: (user, variables) => {
      markSessionAuthenticated()
      if (variables.timezone) {
        dismissTimezoneMismatch(user.id, user.timezone)
      }
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, user)
    },
  })
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (data: RegisterInput): Promise<RegisterResponse> => {
      const response = await axiosClient.post<RegisterResponse>(
        `${getBaseUrl()}/auth/register`,
        data,
        { fetcherOptions: { skipAuthRedirect: true } },
      )
      return response.data
    },
  })
}

export function useVerifyEmailMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    onMutate: () =>
      queryClient.cancelQueries({ queryKey: AUTH_USER_QUERY_KEY }),
    mutationFn: async (data: VerifyEmailInput): Promise<User> => {
      const response = await axiosClient.post<AuthResponse>(
        `${getBaseUrl()}/auth/verify-email`,
        data,
        { fetcherOptions: { skipAuthRedirect: true } },
      )
      return response.data.user
    },
    onSuccess: (user) => {
      markSessionAuthenticated()
      dismissTimezoneMismatch(user.id, user.timezone)
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, user)
    },
  })
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: async (data: ResendVerificationInput): Promise<void> => {
      await axiosClient.post(`${getBaseUrl()}/auth/resend-verification`, data, {
        fetcherOptions: { skipAuthRedirect: true },
      })
    },
  })
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (
      data: ForgotPasswordInput,
    ): Promise<ForgotPasswordResponse> => {
      const response = await axiosClient.post<ForgotPasswordResponse>(
        `${getBaseUrl()}/auth/forgot-password`,
        data,
        { fetcherOptions: { skipAuthRedirect: true } },
      )
      return response.data
    },
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (data: ResetPasswordInput): Promise<void> => {
      await axiosClient.post(`${getBaseUrl()}/auth/reset-password`, data, {
        fetcherOptions: { skipAuthRedirect: true },
      })
    },
  })
}

export function useUpdateCurrentUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateCurrentUserInput): Promise<User> => {
      const response = await axiosClient.patch<AuthResponse>(
        `${getBaseUrl()}/auth/me`,
        data,
      )
      return response.data.user
    },
    onSuccess: (user, variables) => {
      if (variables.timezone !== undefined) {
        dismissTimezoneMismatch(user.id, user.timezone)
      }
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, user)
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const completeLocalLogout = () => {
    markSessionSignedOut()
    queryClient.clear()
    navigate({ to: ROUTES.login })
  }

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await axiosClient.post(`${getBaseUrl()}/auth/logout`, undefined, {
        fetcherOptions: { skipAuthRedirect: true },
      })
    },
    onSuccess: completeLocalLogout,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        completeLocalLogout()
      }
    },
  })
}
