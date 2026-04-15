"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import * as platformsApi from "@/lib/api/platforms";
import * as settingsApi from "@/lib/api/settings";
import type { PlatformRow } from "@/types/models";
import { Trash2, Pencil, Plus } from "lucide-react";

type Integration = { authType: string; apiKey: string };

export default function PlatformsPage() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["platforms"], queryFn: platformsApi.listPlatforms });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: settingsApi.getSettings });

  const integrations = (settings?.platform_integrations || {}) as Record<string, Integration>;

  const [modal, setModal] = useState(false);
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editActive, setEditActive] = useState(true);

  const createMut = useMutation({
    mutationFn: () => platformsApi.createPlatform(slug, label),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platforms"] });
      setModal(false);
      setSlug("");
      setLabel("");
    },
  });

  const patchMut = useMutation({
    mutationFn: (p: { id: number; label?: string; active?: boolean }) => platformsApi.updatePlatform(p.id, p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platforms"] });
      setEditId(null);
    },
  });

  const delMut = useMutation({
    mutationFn: (id: number) => platformsApi.deletePlatform(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platforms"] }),
  });

  const saveIntegration = useMutation({
    mutationFn: async ({ key, int }: { key: string; int: Integration }) => {
      const next = { ...integrations, [key]: int };
      await settingsApi.patchSettings({ platform_integrations: next });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });

  if (isLoading) return <div className="text-sm text-zinc-500">Loading platforms…</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Platforms</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Built-in sources are read-only. Custom platforms support connector credentials (stored in settings).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          <Plus className="h-4 w-4" />
          Add platform
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Auth / API key</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows.map((p: PlatformRow) => {
              const key = p.platform_id != null ? String(p.platform_id) : p.slug;
              const integ = integrations[key] || { authType: "api_key", apiKey: "" };
              return (
                <tr key={`${p.slug}-${p.platform_id ?? "b"}`} className="hover:bg-zinc-900/40">
                  <td className="px-4 py-3 font-mono text-zinc-300">{p.slug}</td>
                  <td className="px-4 py-3 text-zinc-200">
                    {editId === p.platform_id && !p.builtin ? (
                      <input
                        className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                      />
                    ) : (
                      p.label
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{p.builtin ? "Built-in" : "Custom"}</td>
                  <td className="px-4 py-3">
                    {editId === p.platform_id && !p.builtin ? (
                      <input
                        type="checkbox"
                        checked={editActive}
                        onChange={(e) => setEditActive(e.target.checked)}
                      />
                    ) : (
                      <span className="text-zinc-400">{p.active ? "yes" : "no"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!p.builtin && p.platform_id != null ? (
                      <IntegrationCell
                        integ={integ}
                        onSave={(next) => saveIntegration.mutate({ key, int: next })}
                      />
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!p.builtin && p.platform_id != null ? (
                      <div className="flex justify-end gap-2">
                        {editId === p.platform_id ? (
                          <>
                            <button
                              type="button"
                              className="text-xs text-emerald-400"
                              onClick={() =>
                                patchMut.mutate({
                                  id: p.platform_id!,
                                  label: editLabel,
                                  active: editActive,
                                })
                              }
                            >
                              Save
                            </button>
                            <button type="button" className="text-xs text-zinc-500" onClick={() => setEditId(null)}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="rounded p-1 text-zinc-400 hover:bg-zinc-800"
                              onClick={() => {
                                setEditId(p.platform_id!);
                                setEditLabel(p.label);
                                setEditActive(p.active);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded p-1 text-red-400 hover:bg-zinc-800"
                              onClick={() => {
                                if (confirm("Delete this platform?")) delMut.mutate(p.platform_id!);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-lg font-semibold">Add custom platform</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-500">Slug</label>
                <input
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. custom_crm"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Label</label>
                <input
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="text-sm text-zinc-500" onClick={() => setModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={createMut.isPending}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                onClick={() => createMut.mutate()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function IntegrationCell({ integ, onSave }: { integ: Integration; onSave: (i: Integration) => void }) {
  const [authType, setAuthType] = useState(integ.authType || "api_key");
  const [apiKey, setApiKey] = useState(integ.apiKey || "");
  useEffect(() => {
    setAuthType(integ.authType || "api_key");
    setApiKey(integ.apiKey || "");
  }, [integ]);
  return (
    <div className="flex min-w-[200px] flex-col gap-1">
      <select
        className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs"
        value={authType}
        onChange={(e) => setAuthType(e.target.value)}
      >
        <option value="api_key">API key</option>
        <option value="bearer">Bearer token</option>
        <option value="oauth">OAuth (reference)</option>
      </select>
      <input
        type="password"
        className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs"
        placeholder="Token / API key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <button
        type="button"
        className="self-start text-xs text-violet-400 hover:underline"
        onClick={() => onSave({ authType, apiKey })}
      >
        Save credentials
      </button>
    </div>
  );
}
