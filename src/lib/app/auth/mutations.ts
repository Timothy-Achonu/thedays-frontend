import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AUTH_USER_QUERY_KEY } from './queries'
import type {
  AuthResponse,
  GoogleAuthInput,
  LoginInput,
  RegisterInput,
  RegisterResponse,
  ResendVerificationInput,
  UpdateCurrentUserInput,
  VerifyEmailInput,
} from '@/types/auth'
import type { User } from '@/lib/common/models'
import { axiosClient } from '@/lib/common/axios-client'
import { getBaseUrl } from '@/lib/common/getBaseUrl'
import { parseApiError } from '@/lib/utils'
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

function verifyEmailPath(email: string, deliveryFailed = false) {
  return {
    to: '/verify-email' as const,
    search: deliveryFailed
      ? { email, deliveryFailed: true as const }
      : { email },
  }
}

export function useLoginMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

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
      navigate({ to: ROUTES.dashboard })
    },
  })
}

export function useGoogleLoginMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

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
      navigate({ to: ROUTES.dashboard })
    },
  })
}

export function useRegisterMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    onMutate: () =>
      queryClient.cancelQueries({ queryKey: AUTH_USER_QUERY_KEY }),
    mutationFn: async (data: RegisterInput): Promise<RegisterResponse> => {
      const response = await axiosClient.post<RegisterResponse>(
        `${getBaseUrl()}/auth/register`,
        data,
        { fetcherOptions: { skipAuthRedirect: true } },
      )
      return response.data
    },
    onSuccess: (result) => {
      navigate(verifyEmailPath(result.email))
    },
    onError: (error, variables) => {
      if (parseApiError(error).code === 'EMAIL_DELIVERY_FAILED') {
        navigate(verifyEmailPath(variables.email, true))
      }
    },
  })
}

export function useVerifyEmailMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

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
      navigate({ to: ROUTES.dashboard })
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
    onSuccess: (user) => {
      dismissTimezoneMismatch(user.id, user.timezone)
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
