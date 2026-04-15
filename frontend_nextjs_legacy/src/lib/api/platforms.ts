import type { PlatformRow } from "@/types/models";
import { api } from "./client";

export async function listPlatforms() {
  const { data } = await api.get<PlatformRow[]>("/platforms/");
  return data;
}

export async function createPlatform(slug: string, label: string) {
  const { data } = await api.post<PlatformRow>("/platforms/", { slug, label });
  return data;
}

export async function updatePlatform(id: number, body: { label?: string; active?: boolean }) {
  const { data } = await api.patch<PlatformRow>(`/platforms/${id}`, body);
  return data;
}

export async function deletePlatform(id: number) {
  await api.delete(`/platforms/${id}`);
}
