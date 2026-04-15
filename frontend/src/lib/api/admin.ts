import { adminClient } from '@/lib/api/adminClient'
import type { Branding } from '@/store/brandingStore'

export async function adminLogin(email: string, password: string) {
  const { data } = await adminClient.post<{ access_token: string; token_type: string }>('/admin/login', {
    email,
    password,
  })
  return data
}

export type AdminUserRow = { id: string; email: string; created_at: string }

export async function adminListUsers() {
  const { data } = await adminClient.get<{ users: AdminUserRow[] }>('/admin/users')
  return data.users
}

export async function adminGetBranding() {
  const { data } = await adminClient.get<Branding>('/admin/branding')
  return data
}

export async function adminPatchBranding(patch: Partial<Branding>) {
  const { data } = await adminClient.patch<Branding>('/admin/branding', patch)
  return data
}

export async function adminUploadLogo(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await adminClient.post<Branding>('/admin/branding/upload-logo', fd)
  return data
}

export async function adminUploadFavicon(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await adminClient.post<Branding>('/admin/branding/upload-favicon', fd)
  return data
}

export async function adminClearLogo() {
  const { data } = await adminClient.post<Branding>('/admin/branding/clear-logo')
  return data
}

export async function adminClearFavicon() {
  const { data } = await adminClient.post<Branding>('/admin/branding/clear-favicon')
  return data
}
