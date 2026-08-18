import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { axiosClient } from '@/lib/common/axios-client'
import { getBaseUrl } from '@/lib/common/getBaseUrl'
import type { LoginInput, RegisterInput, AuthResponse } from '@/types/auth'
import type { User } from '@/lib/common/models'

const AUTH_USER_QUERY_KEY = ['auth', 'user'] as const

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
      navigate({ to: '/dashboard' })
    },
  })
}

export function useRegisterMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: Omit<RegisterInput, 'timezone'>): Promise<User> => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      const response = await axiosClient.post<AuthResponse>(
        `${getBaseUrl()}/auth/register`,
        { ...data, timezone },
      )
      return response.data.user
    },
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, user)
      navigate({ to: '/dashboard' })
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
      navigate({ to: '/login' })
    },
    onError: () => {
      queryClient.removeQueries({ queryKey: AUTH_USER_QUERY_KEY })
      queryClient.clear()
      navigate({ to: '/login' })
    },
  })
}
