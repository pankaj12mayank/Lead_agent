import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
  type RowSelectionState,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Download, Search, Sparkles, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import {
  bulkDeleteLeads,
  exportLeadsCsv,
  fetchLeads,
  getLead,
  getLeadEmailHistory,
  getLeadHistory,
  getLeadStatusHistory,
  patchLeadStatus,
  updateLead,
  type EmailHistRow,
  type HistoryEvent,
  type StatusHistRow,
} from '@/lib/api/leads'
import { generateLeadMessage as genMsg } from '@/lib/api/messages'
import { cn } from '@/lib/utils/cn'
import { useLeadsUiStore } from '@/store/leadsUiStore'
import type { Lead } from '@/types/models'

const LEAD_STATUSES = [
  'new',
  'contacted',
  'replied',
  'follow_up_sent',
  'meeting_scheduled',
  'deal_discussion',
  'closed',
  'rejected',
  'ready',
  'converted',
] as const

const columnHelper = createColumnHelper<Lead>()

function tierVariant(tier: string): 'hot' | 'warm' | 'cold' | 'muted' {
  const t = (tier || '').toLowerCase()
  if (t === 'hot') return 'hot'
  if (t === 'warm') return 'warm'
  if (t === 'cold') return 'cold'
  return 'muted'
}

function scoreTone(score: number) {
  if (score >= 80) return 'text-emerald-300'
  if (score >= 50) return 'text-amber-200'
  return 'text-sky-300'
}

function fmtShort(iso: string) {
  if (!iso) return '—'
  return iso.length >= 10 ? iso.slice(0, 16).replace('T', ' ') : iso
}

function toLocalInput(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInput(s: string) {
  if (!s) return ''
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 19) + '+00:00'
}

type TimelineRow = { at: string; kind: string; title: string; body: string }

function buildOutreachTimeline(
  h: HistoryEvent[],
  sh: StatusHistRow[],
  em: EmailHistRow[],
): TimelineRow[] {
  const rows: TimelineRow[] = []
  h.forEach((e) => {
    rows.push({
      at: e.created_at,
      kind: 'activity',
      title: e.action,
      body: e.detail ? JSON.stringify(e.detail).slice(0, 240) : '',
    })
  })
  sh.forEach((e) => {
    rows.push({
      at: e.timestamp,
      kind: 'status',
      title: `Status ${e.old_status} → ${e.new_status}`,
      body: '',
    })
  })
  em.forEach((e) => {
    rows.push({
      at: e.sent_at,
      kind: 'email',
      title: `Email (${e.status})`,
      body: e.subject || '',
    })
  })
  rows.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
  return rows
}

export function LeadsPage() {
  const [rows, setRows] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [exportBusy, setExportBusy] = useState(false)
  const [modalLead, setModalLead] = useState<Lead | null>(null)
  const [timeline, setTimeline] = useState<TimelineRow[]>([])
  const [notesDraft, setNotesDraft] = useState('')
  const [lastContactLocal, setLastContactLocal] = useState('')
  const [followUpLocal, setFollowUpLocal] = useState('')
  const [saveBusy, setSaveBusy] = useState(false)
  const [genBusy, setGenBusy] = useState(false)
  const [genErr, setGenErr] = useState<string | null>(null)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 })

  const filters = useLeadsUiStore((s) => s.filters)
  const setSearch = useLeadsUiStore((s) => s.setSearch)
  const setTier = useLeadsUiStore((s) => s.setTier)
  const setPlatform = useLeadsUiStore((s) => s.setPlatform)
  const setStatus = useLeadsUiStore((s) => s.setStatus)
  const resetFilters = useLeadsUiStore((s) => s.resetFilters)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetchLeads({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: filters.search.trim() || undefined,
        status: filters.status || undefined,
        tier: filters.tier || undefined,
        platform: filters.platform || undefined,
        sort: 'created_at_desc',
      })
      setRows(r.items)
      setTotal(r.total)
      setPages(r.pages)
    } finally {
      setLoading(false)
    }
  }, [pagination.pageIndex, pagination.pageSize, filters.search, filters.status, filters.tier, filters.platform])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [filters.search, filters.status, filters.tier, filters.platform])

  const openModal = useCallback(async (lead: Lead) => {
    setModalLead(lead)
    setNotesDraft(lead.notes || '')
    setLastContactLocal(toLocalInput(lead.last_contacted_at || ''))
    setFollowUpLocal(toLocalInput(lead.follow_up_reminder_at || ''))
    setGenErr(null)
    try {
      const [h, sh, em] = await Promise.all([
        getLeadHistory(lead.id),
        getLeadStatusHistory(lead.id),
        getLeadEmailHistory(lead.id),
      ])
      setTimeline(buildOutreachTimeline(h, sh, em))
    } catch {
      setTimeline([])
    }
  }, [])

  const patchLocal = useCallback((id: string, patch: Partial<Lead>) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }, [])

  const onStatusChange = useCallback(
    async (lead: Lead, status: string) => {
      const prev = lead.status
      patchLocal(lead.id, { status })
      try {
        const updated = await patchLeadStatus(lead.id, status)
        patchLocal(lead.id, updated)
        setModalLead((m) => (m && m.id === lead.id ? { ...m, ...updated } : m))
      } catch {
        patchLocal(lead.id, { status: prev })
      }
    },
    [patchLocal],
  )

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            className="rounded border-surface-border"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomePageRowsSelected()
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all on page"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="rounded border-surface-border"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            aria-label="Select row"
          />
        ),
        size: 36,
      }),
      columnHelper.accessor('full_name', {
        header: 'Name',
        cell: ({ row }) => (
          <input
            key={row.original.id + row.original.updated_at}
            defaultValue={row.original.full_name}
            className="w-full min-w-[120px] rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-sm font-medium text-white hover:border-surface-border focus:border-accent/50"
            onBlur={async (e) => {
              const v = e.target.value.trim()
              if (!v || v === row.original.full_name) return
              try {
                const u = await updateLead(row.original.id, { full_name: v })
                patchLocal(row.original.id, u)
              } catch {
                e.target.value = row.original.full_name
              }
            }}
          />
        ),
      }),
      columnHelper.accessor('company_name', {
        header: 'Company',
        cell: ({ row }) => (
          <input
            defaultValue={row.original.company_name}
            className="w-full min-w-[100px] rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-sm text-zinc-300 hover:border-surface-border focus:border-accent/50"
            onBlur={async (e) => {
              const v = e.target.value.trim()
              if (v === (row.original.company_name || '')) return
              try {
                const u = await updateLead(row.original.id, { company_name: v })
                patchLocal(row.original.id, u)
              } catch {
                e.target.value = row.original.company_name
              }
            }}
          />
        ),
      }),
      columnHelper.accessor('source_platform', {
        header: 'Platform',
        cell: (i) => (
          <Badge variant="accent" className="font-mono text-[10px] uppercase">
            {i.getValue() || '—'}
          </Badge>
        ),
      }),
      columnHelper.accessor('score', {
        header: 'Score',
        cell: (i) => {
          const v = Number(i.getValue() ?? 0)
          return <span className={cn('tabular-nums text-sm font-semibold', scoreTone(v))}>{Math.round(v)}</span>
        },
      }),
      columnHelper.accessor('tier', {
        header: 'Tier',
        cell: (i) => {
          const t = String(i.getValue() || '—')
          return <Badge variant={tierVariant(t)}>{t || '—'}</Badge>
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <select
            value={row.original.status || 'new'}
            onChange={(e) => onStatusChange(row.original, e.target.value)}
            className="w-full max-w-[160px] cursor-pointer rounded-lg border border-surface-border bg-surface-raised px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-accent/50"
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        ),
      }),
      columnHelper.accessor('last_contacted_at', {
        header: 'Last contact',
        cell: (i) => <span className="text-xs text-zinc-500">{fmtShort(String(i.getValue() || ''))}</span>,
      }),
      columnHelper.accessor('follow_up_reminder_at', {
        header: 'Follow-up',
        cell: (i) => <span className="text-xs text-zinc-500">{fmtShort(String(i.getValue() || ''))}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => void openModal(row.original)}
              className="rounded-lg border border-surface-border bg-white/[0.03] px-2 py-1 text-xs font-medium text-zinc-200 hover:border-accent/40"
            >
              View
            </button>
            <button
              type="button"
              onClick={async () => {
                setGenErr(null)
                setGenBusy(true)
                try {
                  await genMsg(row.original.id)
                  await load()
                } catch {
                  setGenErr('Could not generate message.')
                } finally {
                  setGenBusy(false)
                }
              }}
              disabled={genBusy}
              className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-1 text-xs font-semibold text-black disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
            </button>
          </div>
        ),
      }),
    ],
    [genBusy, load, onStatusChange, openModal, patchLocal],
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { pagination, rowSelection },
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount: Math.max(1, pages),
    enableRowSelection: true,
    getRowId: (r) => r.id,
    getCoreRowModel: getCoreRowModel(),
  })

  const selectedIds = useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection],
  )

  async function onBulkDelete() {
    if (!selectedIds.length) return
    if (!window.confirm(`Delete ${selectedIds.length} selected leads?`)) return
    await bulkDeleteLeads(selectedIds)
    setRowSelection({})
    await load()
  }

  async function onExportFiltered() {
    setExportBusy(true)
    try {
      await exportLeadsCsv({
        search: filters.search.trim() || undefined,
        status: filters.status || undefined,
        tier: filters.tier || undefined,
        platform: filters.platform || undefined,
      })
    } finally {
      setExportBusy(false)
    }
  }

  async function onExportSelected() {
    if (!selectedIds.length) return
    setExportBusy(true)
    try {
      await exportLeadsCsv({ ids: selectedIds })
    } finally {
      setExportBusy(false)
    }
  }

  async function saveModalMeta() {
    if (!modalLead) return
    setSaveBusy(true)
    try {
      const u = await updateLead(modalLead.id, {
        notes: notesDraft,
        last_contacted_at: lastContactLocal ? fromLocalInput(lastContactLocal) : '',
        follow_up_reminder_at: followUpLocal ? fromLocalInput(followUpLocal) : '',
      })
      patchLocal(modalLead.id, u)
      setModalLead(u)
    } finally {
      setSaveBusy(false)
    }
  }

  if (loading && rows.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500">Loading leads…</div>
    )
  }

  return (
    <div className="mx-auto max-w-[1680px] space-y-6">
      {genErr ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{genErr}</div>
      ) : null}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, company, email…"
            className="w-full rounded-2xl border border-surface-border bg-surface-raised py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-accent/40"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.tier}
            onChange={(e) => setTier(e.target.value)}
            className="rounded-xl border border-surface-border bg-surface-raised px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-accent/40"
          >
            <option value="">All tiers</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
          <select
            value={filters.platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="rounded-xl border border-surface-border bg-surface-raised px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-accent/40"
          >
            <option value="">All platforms</option>
            {[...new Set(rows.map((r) => r.source_platform).filter(Boolean))].sort().map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-surface-border bg-surface-raised px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-accent/40"
          >
            <option value="">All statuses</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-surface-border px-3 py-2.5 text-sm text-zinc-400 hover:text-white"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => void onExportFiltered()}
            disabled={exportBusy}
            className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent-glow px-4 py-2.5 text-sm font-semibold text-accent disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            type="button"
            disabled={!selectedIds.length || exportBusy}
            onClick={() => void onExportSelected()}
            className="rounded-xl border border-surface-border px-4 py-2.5 text-sm text-zinc-300 hover:text-white disabled:opacity-40"
          >
            Export selected
          </button>
          <button
            type="button"
            disabled={!selectedIds.length}
            onClick={() => void onBulkDelete()}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-500/20 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Bulk delete
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-surface-border bg-black/40">
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-sm text-zinc-500">
                    No leads on this page.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-surface-border/80 hover:bg-white/[0.02]">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2 align-middle text-zinc-300">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-surface-border px-4 py-3 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            Showing {rows.length ? pagination.pageIndex * pagination.pageSize + 1 : 0}–
            {pagination.pageIndex * pagination.pageSize + rows.length} of {total}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pagination.pageSize}
              onChange={(e) =>
                setPagination({ pageIndex: 0, pageSize: Number(e.target.value) || 25 })
              }
              className="rounded-lg border border-surface-border bg-black/40 px-2 py-1 text-zinc-300"
            >
              {[10, 25, 50, 100, 200].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-lg border border-surface-border p-1.5 hover:text-white disabled:opacity-30"
              disabled={pagination.pageIndex <= 0}
              onClick={() => setPagination((p) => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="tabular-nums text-zinc-400">
              Page {pagination.pageIndex + 1} / {Math.max(1, pages)}
            </span>
            <button
              type="button"
              className="rounded-lg border border-surface-border p-1.5 hover:text-white disabled:opacity-30"
              disabled={pagination.pageIndex + 1 >= pages}
              onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Modal open={!!modalLead} title={modalLead?.full_name || 'Lead'} onClose={() => setModalLead(null)}>
        {modalLead ? (
          <div className="space-y-6 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant={tierVariant(modalLead.tier)}>Tier: {modalLead.tier || '—'}</Badge>
              <span className={cn('rounded-full border border-surface-border px-2 py-0.5 text-xs tabular-nums', scoreTone(Number(modalLead.score)))}>
                Score {Math.round(Number(modalLead.score ?? 0))}
              </span>
              <select
                value={modalLead.status || 'new'}
                onChange={(e) => void onStatusChange(modalLead, e.target.value)}
                className="rounded-lg border border-surface-border bg-black/40 px-2 py-1 text-xs text-white"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Title', modalLead.title],
                ['Company', modalLead.company_name],
                ['Email', modalLead.email],
                ['Website', modalLead.company_website],
                ['LinkedIn', modalLead.linkedin_url],
                ['Industry', modalLead.industry],
                ['Location', modalLead.location],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-surface-border bg-black/30 px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{k}</div>
                  <div className="mt-1 break-all text-zinc-200">{v || '—'}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Notes</div>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-xl border border-surface-border bg-black/40 px-3 py-2 text-zinc-200 outline-none focus:border-accent/40"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Last contacted</div>
                <input
                  type="datetime-local"
                  value={lastContactLocal}
                  onChange={(e) => setLastContactLocal(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-surface-border bg-black/40 px-3 py-2 text-zinc-200"
                />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Follow-up reminder</div>
                <input
                  type="datetime-local"
                  value={followUpLocal}
                  onChange={(e) => setFollowUpLocal(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-surface-border bg-black/40 px-3 py-2 text-zinc-200"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saveBusy}
                onClick={() => void saveModalMeta()}
                className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-black hover:bg-accent-muted disabled:opacity-50"
              >
                {saveBusy ? 'Saving…' : 'Save notes & dates'}
              </button>
              <button
                type="button"
                disabled={genBusy}
                onClick={async () => {
                  if (!modalLead) return
                  setGenBusy(true)
                  try {
                    await genMsg(modalLead.id)
                    await load()
                    const fresh = await getLead(modalLead.id)
                    await openModal(fresh)
                  } finally {
                    setGenBusy(false)
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-accent/40 px-4 py-2 text-xs font-semibold text-accent"
              >
                <Sparkles className="h-4 w-4" />
                Generate message
              </button>
            </div>
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Outreach history
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-surface-border bg-black/30 p-3">
                {timeline.length === 0 ? (
                  <p className="text-xs text-zinc-600">No history rows yet.</p>
                ) : (
                  timeline.map((t, i) => (
                    <div key={i} className="border-b border-surface-border/60 pb-2 text-xs last:border-0">
                      <div className="font-medium text-zinc-300">{t.title}</div>
                      <div className="text-[10px] text-zinc-500">{t.at}</div>
                      {t.body ? <div className="mt-1 text-zinc-500">{t.body}</div> : null}
                    </div>
                  ))
                )}
              </div>
            </div>
            <textarea
              readOnly
              value={modalLead.personalized_message || ''}
              rows={5}
              className="w-full resize-none rounded-xl border border-surface-border bg-black/40 px-3 py-2 text-xs text-zinc-300"
              placeholder="Personalized message"
            />
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
