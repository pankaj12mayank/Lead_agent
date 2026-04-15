import { api } from './client'

export type MessageResponse = {
  lead_id: string
  message: string
  email: string
  subject: string
  status: string
}

export async function generateLeadMessage(leadId: string) {
  const { data } = await api.post<MessageResponse>(`/messages/generate/${encodeURIComponent(leadId)}`)
  return data
}
