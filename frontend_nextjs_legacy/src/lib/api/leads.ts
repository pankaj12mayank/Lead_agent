import type { Lead } from "@/types/models";
import { api } from "./client";

export async function listLeads() {
  const { data } = await api.get<Lead[]>("/leads/");
  return data;
}

export async function getLead(id: string) {
  const { data } = await api.get<Lead>(`/leads/${id}`);
  return data;
}

export async function createLead(payload: Partial<Lead> & { name: string; platform: string; profile_url: string }) {
  const { data } = await api.post<Lead>("/leads/add", payload);
  return data;
}

export async function updateLead(id: string, patch: Partial<Lead>) {
  const { data } = await api.patch<Lead>(`/leads/${id}`, patch);
  return data;
}

export async function updateLeadStatus(id: string, status: string) {
  const { data } = await api.patch<Lead>(`/leads/${id}/status`, { status });
  return data;
}

export async function deleteLead(id: string) {
  await api.delete(`/leads/${id}`);
}

export async function bulkImportLeads(leads: unknown[]) {
  const { data } = await api.post<{ created: number; errors: string[] }>("/leads/bulk-import", { leads });
  return data;
}

export async function bulkImportCsv(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{ created: number; errors: string[] }>("/leads/bulk-import", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getLeadHistory(id: string) {
  const { data } = await api.get<unknown[]>(`/leads/${id}/history`);
  return data;
}

export async function getStatusHistory(id: string) {
  const { data } = await api.get<
    { history_id: number; lead_id: string; old_status: string; new_status: string; timestamp: string }[]
  >(`/leads/${id}/status-history`);
  return data;
}

export async function getEmailHistory(id: string) {
  const { data } = await api.get<
    {
      email_id: string;
      lead_id: string;
      recipient_email: string;
      subject: string;
      body: string;
      status: string;
      sent_at: string;
    }[]
  >(`/leads/${id}/email-history`);
  return data;
}
