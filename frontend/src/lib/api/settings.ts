import type { AppSettings } from '@/types/models'

import { api } from './client'

export async function getSettings() {
  const { data } = await api.get<{ data: AppSettings }>('/settings/')
  return data.data
}

export async function patchSettings(patch: AppSettings) {
  const { data } = await api.patch<{ data: AppSettings }>('/settings/', patch)
  return data.data
}
