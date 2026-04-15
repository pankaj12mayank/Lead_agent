"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import * as settingsApi from "@/lib/api/settings";
import * as toolsApi from "@/lib/api/tools";

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["settings"], queryFn: settingsApi.getSettings });

  const [form, setForm] = useState({
    smtp_host: "",
    smtp_port: "587",
    smtp_email: "",
    smtp_password: "",
    smtp_use_tls: "true",
    sender_name: "",
    sender_email: "",
    email_signature: "",
    model_name: "",
    use_ollama: "true",
    free_api_mode: "false",
  });

  useEffect(() => {
    if (!data) return;
    setForm((f) => ({
      ...f,
      smtp_host: String(data.smtp_host ?? ""),
      smtp_port: String(data.smtp_port ?? "587"),
      smtp_email: String(data.smtp_email ?? ""),
      smtp_password: String(data.smtp_password ?? ""),
      smtp_use_tls: String(data.smtp_use_tls ?? "true"),
      sender_name: String(data.sender_name ?? ""),
      sender_email: String(data.sender_email ?? ""),
      email_signature: String(data.email_signature ?? ""),
      model_name: String(data.model_name ?? ""),
      use_ollama: String(data.use_ollama ?? "true"),
      free_api_mode: String(data.free_api_mode ?? "false"),
    }));
  }, [data]);

  const save = useMutation({
    mutationFn: () => settingsApi.patchSettings(form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });

  const [toolMsg, setToolMsg] = useState<string | null>(null);

  const migrateMut = useMutation({
    mutationFn: () => toolsApi.migrateCsvToSqlite(),
    onSuccess: (d) => {
      setToolMsg(d.message);
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => setToolMsg("Migration failed. Check API logs and STORAGE_MODE."),
  });

  const genMsgMut = useMutation({
    mutationFn: () => toolsApi.generatePendingMessages(),
    onSuccess: (d) => {
      setToolMsg(d.message);
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: () => setToolMsg("Bulk generate failed."),
  });

  if (isLoading && !data) {
    return <div className="text-sm text-zinc-500">Loading settings…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          SMTP and AI preferences are persisted to server runtime settings (merged with environment defaults).
        </p>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-sm font-semibold text-zinc-300">Data &amp; automation</h2>
        <p className="mt-2 text-xs text-zinc-500">
          Replaces old one-off scripts: run these from the product UI after signing in.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            disabled={migrateMut.isPending}
            onClick={() => {
              setToolMsg(null);
              migrateMut.mutate();
            }}
            className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
          >
            {migrateMut.isPending ? "Importing…" : "Import CSV → SQLite"}
          </button>
          <button
            type="button"
            disabled={genMsgMut.isPending}
            onClick={() => {
              setToolMsg(null);
              genMsgMut.mutate();
            }}
            className="rounded-lg border border-violet-700/50 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50 disabled:opacity-50"
          >
            {genMsgMut.isPending ? "Generating…" : "Generate AI for empty messages"}
          </button>
        </div>
        {toolMsg ? <p className="mt-3 text-sm text-emerald-400">{toolMsg}</p> : null}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-sm font-semibold text-zinc-300">SMTP</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="SMTP host" v={form.smtp_host} onChange={(v) => setForm((s) => ({ ...s, smtp_host: v }))} />
          <Field label="SMTP port" v={form.smtp_port} onChange={(v) => setForm((s) => ({ ...s, smtp_port: v }))} />
          <Field label="SMTP username / email" v={form.smtp_email} onChange={(v) => setForm((s) => ({ ...s, smtp_email: v }))} />
          <Field
            label="SMTP password"
            v={form.smtp_password}
            onChange={(v) => setForm((s) => ({ ...s, smtp_password: v }))}
            password
          />
          <label className="flex items-center gap-2 text-sm text-zinc-400 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.smtp_use_tls === "true"}
              onChange={(e) =>
                setForm((s) => ({ ...s, smtp_use_tls: e.target.checked ? "true" : "false" }))
              }
            />
            Use TLS (STARTTLS) for port 587
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-sm font-semibold text-zinc-300">Sender</h2>
        <div className="mt-4 grid gap-4">
          <Field label="Sender name" v={form.sender_name} onChange={(v) => setForm((s) => ({ ...s, sender_name: v }))} />
          <Field
            label="Sender email"
            v={form.sender_email}
            onChange={(v) => setForm((s) => ({ ...s, sender_email: v }))}
          />
          <div>
            <label className="text-xs font-medium text-zinc-500">Signature</label>
            <textarea
              className="mt-1 min-h-[100px] w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              value={form.email_signature}
              onChange={(e) => setForm((s) => ({ ...s, email_signature: e.target.value }))}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-sm font-semibold text-zinc-300">Ollama / AI</h2>
        <div className="mt-4 grid gap-4">
          <Field label="Model name" v={form.model_name} onChange={(v) => setForm((s) => ({ ...s, model_name: v }))} />
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={form.use_ollama === "true"}
              onChange={(e) => setForm((s) => ({ ...s, use_ollama: e.target.checked ? "true" : "false" }))}
            />
            Use Ollama
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={form.free_api_mode === "true"}
              onChange={(e) => setForm((s) => ({ ...s, free_api_mode: e.target.checked ? "true" : "false" }))}
            />
            Free API mode (template fallbacks only)
          </label>
        </div>
      </section>

      <button
        type="button"
        disabled={save.isPending}
        onClick={() => save.mutate()}
        className="rounded-lg bg-violet-600 px-6 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
      >
        {save.isPending ? "Saving…" : "Save settings"}
      </button>
      {save.isSuccess ? <p className="text-sm text-emerald-400">Saved.</p> : null}
      {save.isError ? <p className="text-sm text-red-400">Save failed.</p> : null}
    </div>
  );
}

function Field({
  label,
  v,
  onChange,
  password,
}: {
  label: string;
  v: string;
  onChange: (v: string) => void;
  password?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-500">{label}</label>
      <input
        type={password ? "password" : "text"}
        className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        value={v}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
