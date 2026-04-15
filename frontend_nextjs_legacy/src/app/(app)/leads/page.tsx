"use client";

import { useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Lead } from "@/types/models";
import * as leadsApi from "@/lib/api/leads";
import { StatusBadge } from "@/components/leads/StatusBadge";
import { Plus, Upload, Download, Search } from "lucide-react";

const PAGE_SIZE = 10;

function exportCsv(rows: Lead[]) {
  const cols = [
    "lead_id",
    "name",
    "email",
    "platform",
    "tier",
    "score",
    "status",
    "profile_url",
    "company",
    "created_at",
  ];
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [cols.join(","), ...rows.map((r) => cols.map((c) => esc((r as Record<string, unknown>)[c])).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leads-export.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function LeadsPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: all = [], isLoading } = useQuery({ queryKey: ["leads"], queryFn: leadsApi.listLeads });

  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("");
  const [tier, setTier] = useState("");
  const [scoreMin, setScoreMin] = useState("");
  const [scoreMax, setScoreMax] = useState("");
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    platform: "",
    profile_url: "",
    email: "",
    phone: "",
    company: "",
    location: "",
    notes: "",
  });

  const filtered = useMemo(() => {
    const smin = scoreMin === "" ? null : Number(scoreMin);
    const smax = scoreMax === "" ? null : Number(scoreMax);
    return all.filter((l) => {
      if (q && !`${l.name} ${l.email} ${l.company}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (platform && l.platform !== platform) return false;
      if (status && (l.status || "").toLowerCase() !== status.toLowerCase()) return false;
      if (tier && (l.tier || "").toLowerCase() !== tier.toLowerCase()) return false;
      const sc = Number(l.score ?? 0);
      if (smin !== null && !Number.isNaN(smin) && sc < smin) return false;
      if (smax !== null && !Number.isNaN(smax) && sc > smax) return false;
      return true;
    });
  }, [all, q, platform, status, tier, scoreMin, scoreMax]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages - 1);
  const slice = filtered.slice(pageSafe * PAGE_SIZE, pageSafe * PAGE_SIZE + PAGE_SIZE);

  const createMut = useMutation({
    mutationFn: () =>
      leadsApi.createLead({
        name: form.name,
        platform: form.platform,
        profile_url: form.profile_url,
        email: form.email,
        phone: form.phone,
        company: form.company,
        location: form.location,
        notes: form.notes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setModal(false);
      setForm({
        name: "",
        platform: "",
        profile_url: "",
        email: "",
        phone: "",
        company: "",
        location: "",
        notes: "",
      });
    },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => leadsApi.updateLeadStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const bulkMut = useMutation({
    mutationFn: (file: File) => leadsApi.bulkImportCsv(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const platforms = useMemo(() => {
    const s = new Set<string>();
    all.forEach((l) => l.platform && s.add(l.platform));
    return Array.from(s).sort();
  }, [all]);

  if (isLoading) return <div className="text-sm text-zinc-500">Loading leads…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Add and manage leads in the browser or via the REST API — no command-line scraping. Use{" "}
            <strong className="text-zinc-400">Add lead</strong>, <strong className="text-zinc-400">Bulk import</strong>
            , or integrate your own capture flow against <code className="rounded bg-zinc-800 px-1">POST /leads/add</code>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            <Plus className="h-4 w-4" />
            Add lead
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            <Upload className="h-4 w-4" />
            Bulk import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) bulkMut.mutate(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => exportCsv(filtered)}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {bulkMut.isSuccess ? (
        <p className="text-sm text-emerald-400">
          Imported {bulkMut.data?.created} leads. {bulkMut.data?.errors?.length ? `${bulkMut.data.errors.length} row warnings.` : ""}
        </p>
      ) : null}
      {bulkMut.isError ? <p className="text-sm text-red-400">Bulk import failed.</p> : null}

      <div className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            placeholder="Search name, email, company…"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-9 pr-3 text-sm"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          value={platform}
          onChange={(e) => {
            setPlatform(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All platforms</option>
          {platforms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All statuses</option>
          {["new", "ready", "contacted", "converted"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          value={tier}
          onChange={(e) => {
            setTier(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All tiers</option>
          {["hot", "warm", "cold"].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            placeholder="Min score"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
            value={scoreMin}
            onChange={(e) => {
              setScoreMin(e.target.value);
              setPage(0);
            }}
          />
          <input
            placeholder="Max score"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
            value={scoreMax}
            onChange={(e) => {
              setScoreMax(e.target.value);
              setPage(0);
            }}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {slice.map((l) => (
              <tr key={l.lead_id} className="hover:bg-zinc-900/50">
                <td className="px-4 py-3 font-medium text-zinc-200">
                  <Link href={`/leads/${l.lead_id}`} className="hover:text-violet-300">
                    {l.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-400">{l.platform}</td>
                <td className="px-4 py-3 capitalize text-zinc-400">{l.tier}</td>
                <td className="px-4 py-3 text-zinc-400">{l.score}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs"
                      value={(l.status || "").toLowerCase()}
                      onChange={(e) => statusMut.mutate({ id: l.lead_id, status: e.target.value })}
                    >
                      {["new", "ready", "contacted", "converted"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <StatusBadge status={l.status} />
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">{l.updated_at?.slice(0, 16) || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/leads/${l.lead_id}`} className="text-xs font-medium text-violet-400 hover:underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          Page {pageSafe + 1} of {totalPages} · {filtered.length} leads
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pageSafe <= 0}
            className="rounded-lg border border-zinc-700 px-3 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Prev
          </button>
          <button
            type="button"
            disabled={pageSafe >= totalPages - 1}
            className="rounded-lg border border-zinc-700 px-3 py-1 disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Next
          </button>
        </div>
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">New lead</h2>
            <div className="mt-4 grid gap-3">
              {(["name", "platform", "profile_url", "email", "phone", "company", "location", "notes"] as const).map(
                (field) => (
                  <div key={field}>
                    <label className="text-xs text-zinc-500">{field}</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
                      value={(form as Record<string, string>)[field]}
                      onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    />
                  </div>
                )
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="rounded-lg px-3 py-2 text-sm text-zinc-400" onClick={() => setModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={createMut.isPending}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                onClick={() => createMut.mutate()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
