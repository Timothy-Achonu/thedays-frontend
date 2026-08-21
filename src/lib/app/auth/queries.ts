import { queryOptions, useQuery } from '@tanstack/react-query'
import { getCurrentUser } from './services'

export const AUTH_USER_QUERY_KEY = ['auth', 'user'] as const

export const currentUserQueryOptions = queryOptions({
  queryKey: AUTH_USER_QUERY_KEY,
  queryFn: ({ signal }) => getCurrentUser(signal),
  retry: false,
})

export function useCurrentUserQuery(enabled = true) {
  return useQuery({ ...currentUserQueryOptions, enabled })
}
