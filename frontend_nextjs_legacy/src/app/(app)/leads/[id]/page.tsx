"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import * as leadsApi from "@/lib/api/leads";
import * as messagesApi from "@/lib/api/messages";
import { StatusBadge } from "@/components/leads/StatusBadge";
import { ArrowLeft, Mail, Sparkles, Send } from "lucide-react";

export default function LeadDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();
  const qc = useQueryClient();

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => leadsApi.getLead(id),
  });
  const { data: hist = [] } = useQuery({
    queryKey: ["lead-hist", id],
    queryFn: () => leadsApi.getLeadHistory(id),
  });
  const { data: statusHist = [] } = useQuery({
    queryKey: ["status-hist", id],
    queryFn: () => leadsApi.getStatusHistory(id),
  });
  const { data: emailHist = [] } = useQuery({
    queryKey: ["email-hist", id],
    queryFn: () => leadsApi.getEmailHistory(id),
  });

  const [notes, setNotes] = useState("");
  useEffect(() => {
    if (lead) setNotes(lead.notes || "");
  }, [lead]);

  const saveNotes = useMutation({
    mutationFn: () => leadsApi.updateLead(id, { notes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lead", id] }),
  });

  const statusMut = useMutation({
    mutationFn: (status: string) => leadsApi.updateLeadStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lead", id] });
      qc.invalidateQueries({ queryKey: ["status-hist", id] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const genMut = useMutation({
    mutationFn: () => messagesApi.generateMessage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lead", id] });
      qc.invalidateQueries({ queryKey: ["lead-hist", id] });
    },
  });

  const sendMut = useMutation({
    mutationFn: () => messagesApi.sendMessage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lead", id] });
      qc.invalidateQueries({ queryKey: ["email-hist", id] });
      qc.invalidateQueries({ queryKey: ["status-hist", id] });
    },
  });

  if (isLoading || !lead) {
    return <div className="text-sm text-zinc-500">Loading lead…</div>;
  }

  const preview = `To: ${lead.email || "—"}\nSubject: ${lead.subject || "—"}\n\n${lead.message || "(no message yet)"}`;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <button
        type="button"
        onClick={() => router.push("/leads")}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to leads
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">{lead.lead_id}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-zinc-400">Score {lead.score}</span>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-300">{lead.tier}</span>
          <StatusBadge status={lead.status} />
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
            value={(lead.status || "new").toLowerCase()}
            onChange={(e) => statusMut.mutate(e.target.value)}
          >
            {["new", "ready", "contacted", "converted"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="text-sm font-medium text-zinc-400">Contact</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Email</dt>
              <dd className="truncate text-zinc-200">{lead.email || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Phone</dt>
              <dd className="text-zinc-200">{lead.phone || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Company</dt>
              <dd className="truncate text-zinc-200">{lead.company || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Platform</dt>
              <dd className="text-zinc-200">{lead.platform}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Location</dt>
              <dd className="text-zinc-200">{lead.location || "—"}</dd>
            </div>
            <div className="pt-2">
              <dt className="text-zinc-500">Profile</dt>
              <dd className="mt-1 break-all text-violet-400">
                <a href={lead.profile_url} target="_blank" rel="noreferrer">
                  {lead.profile_url}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="text-sm font-medium text-zinc-400">Notes</h2>
          <textarea
            className="mt-3 min-h-[140px] w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button
            type="button"
            onClick={() => saveNotes.mutate()}
            disabled={saveNotes.isPending}
            className="mt-3 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
          >
            Save notes
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-zinc-400">Outreach</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => genMut.mutate()}
              disabled={genMut.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Regenerate AI
            </button>
            <button
              type="button"
              onClick={() => sendMut.mutate()}
              disabled={sendMut.isPending || !lead.email}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-100 hover:bg-zinc-700 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
              Send email
            </button>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <div className="text-xs text-zinc-500">Subject</div>
            <div className="mt-1 text-sm text-zinc-200">{lead.subject || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Message</div>
            <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-zinc-950 p-3 text-sm text-zinc-300">
              {lead.message || "—"}
            </pre>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
              <Mail className="h-3.5 w-3.5" />
              Email preview
            </div>
            <pre className="whitespace-pre-wrap rounded-lg border border-zinc-800 bg-black/40 p-3 text-xs text-zinc-400">
              {preview}
            </pre>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="text-sm font-medium text-zinc-400">Status history</h2>
          <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto text-xs">
            {statusHist.length === 0 ? (
              <li className="text-zinc-600">No transitions yet.</li>
            ) : (
              statusHist.map((h) => (
                <li key={h.history_id} className="rounded border border-zinc-800/80 bg-zinc-950/60 px-2 py-1.5">
                  <span className="text-zinc-500">{h.timestamp}</span>{" "}
                  <span className="text-zinc-400">{h.old_status || "—"}</span>
                  <span className="text-zinc-600"> → </span>
                  <span className="text-violet-300">{h.new_status}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="text-sm font-medium text-zinc-400">Email history</h2>
          <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto text-xs">
            {emailHist.length === 0 ? (
              <li className="text-zinc-600">No sends logged.</li>
            ) : (
              emailHist.map((e) => (
                <li key={e.email_id} className="rounded border border-zinc-800/80 bg-zinc-950/60 px-2 py-1.5">
                  <div className="font-medium text-zinc-300">{e.status}</div>
                  <div className="text-zinc-500">{e.sent_at}</div>
                  <div className="truncate text-zinc-400">{e.recipient_email}</div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="text-sm font-medium text-zinc-400">Activity (API)</h2>
        <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-xs text-zinc-500">
          {hist.length === 0 ? (
            <li>No events.</li>
          ) : (
            hist.map((e: unknown, i: number) => (
              <li key={i} className="font-mono">
                {JSON.stringify(e)}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
