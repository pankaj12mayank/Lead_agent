import { api } from "./client";

export async function migrateCsvToSqlite(payload?: { csv_path?: string | null; db_path?: string | null }) {
  const { data } = await api.post<{ migrated: number; message: string }>("/tools/migrate-csv-to-sqlite", payload ?? {});
  return data;
}

export async function generatePendingMessages() {
  const { data } = await api.post<{ processed: number; message: string }>("/tools/generate-pending-messages");
  return data;
}
