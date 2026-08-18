import type { User } from '@/lib/common/models'
import { getBaseUrl, network } from '@/lib/common'

export const getCurrentUser = async () => {
  const URL = `${getBaseUrl()}/auth/me`
  return network.get<User>(URL)
}
