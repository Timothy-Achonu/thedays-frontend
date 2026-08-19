import { queryOptions, useQuery } from '@tanstack/react-query'
import { getCurrentUser } from './services'

export const AUTH_USER_QUERY_KEY = ['auth', 'user'] as const

export const currentUserQueryOptions = queryOptions({
  queryKey: AUTH_USER_QUERY_KEY,
  queryFn: getCurrentUser,
  retry: false,
})

export function useCurrentUserQuery() {
  return useQuery(currentUserQueryOptions)
}
