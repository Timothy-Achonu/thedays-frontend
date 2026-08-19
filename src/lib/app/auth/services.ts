import type { AuthResponse } from '@/types/auth'
import type { User } from '@/lib/common/models'
import { axiosClient } from '@/lib/common/axios-client'
import { getBaseUrl } from '@/lib/common/getBaseUrl'

export async function getCurrentUser(): Promise<User> {
  const response = await axiosClient.get<AuthResponse>(
    `${getBaseUrl()}/auth/me`,
    { fetcherOptions: { skipAuthRedirect: true } },
  )
  return response.data.user
}
