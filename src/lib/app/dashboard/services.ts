import type { DashboardSummaryResponse } from '@/types/dashboard'
import { axiosClient } from '@/lib/common/axios-client'
import { getBaseUrl } from '@/lib/common/getBaseUrl'

export async function getDashboardSummary(
  signal?: AbortSignal,
): Promise<DashboardSummaryResponse> {
  const response = await axiosClient.get<DashboardSummaryResponse>(
    `${getBaseUrl()}/dashboard`,
    { signal },
  )
  return response.data
}
