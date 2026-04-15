import { api } from "./client";

export type MessagePayload = {
  lead_id: string;
  message: string;
  email: string;
  subject: string;
  status: string;
};

export async function generateMessage(leadId: string) {
  const { data } = await api.post<MessagePayload>(`/messages/generate/${leadId}`);
  return data;
}

export async function sendMessage(leadId: string) {
  const { data } = await api.post<MessagePayload>(`/messages/send/${leadId}`);
  return data;
}

export async function getMessage(leadId: string) {
  const { data } = await api.get<MessagePayload>(`/messages/${leadId}`);
  return data;
}
