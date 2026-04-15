import type { PlatformRow } from '@/types/models'

import { api } from './client'

export async function listPlatforms() {
  const { data } = await api.get<PlatformRow[]>('/platforms/')
  return data
}
