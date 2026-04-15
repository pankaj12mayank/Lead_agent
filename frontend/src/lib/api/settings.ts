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

export async function testOllamaConnection(model_name?: string) {
  const { data } = await api.post<{
    ok: boolean
    detail?: string
    available_sample?: string[]
    hints?: string[]
    auto_started?: boolean
  }>('/settings/test-ollama', { model_name: model_name || null })
  return data
}

export async function testExternalApiConnection(body?: {
  api_key?: string
  base_url?: string
  model?: string
}) {
  const { data } = await api.post<{ ok: boolean; detail?: string }>('/settings/test-external-api', body ?? {})
  return data
}
