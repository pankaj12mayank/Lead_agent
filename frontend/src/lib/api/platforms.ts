import type { PlatformRow } from '@/types/models'

import { api } from './client'

export function notifyPlatformsChanged() {
  try {
    window.dispatchEvent(new CustomEvent('leadpilot-platforms-changed'))
  } catch {
    /* ignore */
  }
}

export async function listPlatforms() {
  const { data } = await api.get<PlatformRow[]>('/platforms/')
  return data
}

export async function createPlatform(body: { slug: string; label: string; login_url: string }) {
  const { data } = await api.post<PlatformRow>('/platforms/', body)
  notifyPlatformsChanged()
  return data
}

export async function deletePlatform(platformId: number) {
  await api.delete(`/platforms/${platformId}`)
  notifyPlatformsChanged()
}

export async function patchBuiltinActive(slug: string, active: boolean) {
  const { data } = await api.patch<PlatformRow>(`/platforms/builtin/${encodeURIComponent(slug)}`, { active })
  notifyPlatformsChanged()
  return data
}

export async function patchCustomPlatform(
  platformId: number,
  patch: { label?: string; active?: boolean },
) {
  const { data } = await api.patch<PlatformRow>(`/platforms/${platformId}`, patch)
  notifyPlatformsChanged()
  return data
}
