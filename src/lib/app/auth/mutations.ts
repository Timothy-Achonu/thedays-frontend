import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AUTH_USER_QUERY_KEY } from './queries'
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  RegisterResponse,
  ResendVerificationInput,
  VerifyEmailInput,
} from '@/types/auth'
import type { User } from '@/lib/common/models'
import { axiosClient } from '@/lib/common/axios-client'
import { getBaseUrl } from '@/lib/common/getBaseUrl'
import { parseApiError } from '@/lib/utils'
import { ROUTES } from '@/lib/constants/routes'

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
    mutationFn: async (data: LoginInput): Promise<User> => {
      const response = await axiosClient.post<AuthResponse>(
        `${getBaseUrl()}/auth/login`,
        data,
      )
      return response.data.user
    },
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, user)
      navigate({ to: ROUTES.dashboard })
    },
  })
}

export function useRegisterMutation() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (
      data: Omit<RegisterInput, 'timezone'>,
    ): Promise<RegisterResponse> => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      const response = await axiosClient.post<RegisterResponse>(
        `${getBaseUrl()}/auth/register`,
        { ...data, timezone },
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
    mutationFn: async (data: VerifyEmailInput): Promise<User> => {
      const response = await axiosClient.post<AuthResponse>(
        `${getBaseUrl()}/auth/verify-email`,
        data,
      )
      return response.data.user
    },
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, user)
      navigate({ to: ROUTES.dashboard })
    },
  })
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: async (data: ResendVerificationInput): Promise<void> => {
      await axiosClient.post(`${getBaseUrl()}/auth/resend-verification`, data)
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await axiosClient.post(`${getBaseUrl()}/auth/logout`, undefined, {
        fetcherOptions: { skipAuthRedirect: true },
      })
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: AUTH_USER_QUERY_KEY })
      queryClient.clear()
      navigate({ to: ROUTES.login })
    },
    onError: () => {
      queryClient.removeQueries({ queryKey: AUTH_USER_QUERY_KEY })
      queryClient.clear()
      navigate({ to: ROUTES.login })
    },
  })
}
