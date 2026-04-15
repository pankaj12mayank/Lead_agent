import type { PlatformRow } from '@/types/models'

import { api } from './client'

export async function listPlatforms() {
  const { data } = await api.get<PlatformRow[]>('/platforms/')
  return data
}

export async function createPlatform(body: { slug: string; label: string }) {
  const { data } = await api.post<PlatformRow>('/platforms/', body)
  return data
}

export async function deletePlatform(platformId: number) {
  await api.delete(`/platforms/${platformId}`)
}
