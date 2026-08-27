import { queryOptions, useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from './services'

export const DASHBOARD_QUERY_KEY = ['dashboard-summary'] as const

export const dashboardQueryOptions = queryOptions({
  queryKey: DASHBOARD_QUERY_KEY,
  queryFn: ({ signal }) => getDashboardSummary(signal),
  refetchOnMount: true,
})

export function useDashboardSummaryQuery() {
  return useQuery(dashboardQueryOptions)
}
