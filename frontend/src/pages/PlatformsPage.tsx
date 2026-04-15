import { KeyRound, Loader2, Play, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Modal } from '@/components/ui/Modal'
import { fetchScraperStatus, fetchSession, openManualLogin, runScraper, type ScraperStatus } from '@/lib/api/scraper'
import { listPlatforms } from '@/lib/api/platforms'
import { cn } from '@/lib/utils/cn'
import type { PlatformRow } from '@/types/models'

type SessionMap = Record<string, { has_session: boolean; path: string }>

export function PlatformsPage() {
  const [rows, setRows] = useState<PlatformRow[]>([])
  const [scraper, setScraper] = useState<ScraperStatus | null>(null)
  const [sessions, setSessions] = useState<SessionMap>({})
  const [loading, setLoading] = useState(true)
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const [runOpen, setRunOpen] = useState(false)
  const [runPlatform, setRunPlatform] = useState('')
  const [keyword, setKeyword] = useState('')
  const [maxLeads, setMaxLeads] = useState(20)
  const [delayMin, setDelayMin] = useState(3)
  const [delayMax, setDelayMax] = useState(5)
  const [runMsg, setRunMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [plats, st] = await Promise.all([listPlatforms(), fetchScraperStatus()])
      setRows(plats)
      setScraper(st)
      const map: SessionMap = {}
      await Promise.all(
        plats.map(async (p) => {
          try {
            const s = await fetchSession(p.slug)
            map[p.slug] = { has_session: s.has_session, path: s.path }
          } catch {
            map[p.slug] = { has_session: false, path: '' }
          }
        }),
      )
      setSessions(map)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (scraper) {
      setMaxLeads(scraper.max_leads_default)
      setDelayMin(scraper.delay_seconds_range[0])
      setDelayMax(scraper.delay_seconds_range[1])
    }
  }, [scraper])

  async function onManualLogin(slug: string) {
    setBusySlug(slug)
    try {
      await openManualLogin(slug, 180)
      await load()
    } catch (e) {
      console.error(e)
    } finally {
      setBusySlug(null)
    }
  }

  async function onRun() {
    setRunMsg(null)
    setBusySlug(runPlatform)
    try {
      const res = await runScraper({
        platform: runPlatform,
        keyword: keyword.trim(),
        max_leads: maxLeads,
        delay_min_seconds: delayMin,
        delay_max_seconds: delayMax,
        headless: true,
      })
      setRunMsg(`Run finished: ${JSON.stringify(res).slice(0, 400)}…`)
      setRunOpen(false)
      await load()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      setRunMsg(err.response?.data?.detail || 'Run failed.')
    } finally {
      setBusySlug(null)
    }
  }

  if (loading || !scraper) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading platforms…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
          Engine: <span className="text-zinc-300">{scraper.engine}</span>. Max leads cap{' '}
          <span className="text-zinc-300">{scraper.max_leads_cap}</span>. Default delay{' '}
          <span className="text-zinc-300">
            {scraper.delay_seconds_range[0]}–{scraper.delay_seconds_range[1]}s
          </span>
          .
        </p>
        <button
          type="button"
          onClick={() => load()}
          className="inline-flex items-center gap-2 rounded-xl border border-surface-border px-4 py-2 text-sm text-zinc-300 transition hover:border-accent/40 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((p) => {
          const sess = sessions[p.slug]
          const loggedIn = !!sess?.has_session
          return (
            <div
              key={p.slug}
              className="flex flex-col rounded-2xl border border-surface-border bg-surface-card p-6 shadow-card transition hover:border-accent/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{p.label}</h3>
                  <p className="mt-1 font-mono text-xs text-zinc-500">{p.slug}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    p.active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-zinc-800 text-zinc-500',
                  )}
                >
                  {p.active ? 'Active' : 'Off'}
                </span>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-500">Login session</dt>
                  <dd className={loggedIn ? 'text-emerald-300' : 'text-amber-200'}>
                    {loggedIn ? 'Saved' : 'Missing'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-500">Builtin</dt>
                  <dd className="text-zinc-300">{p.builtin ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onManualLogin(p.slug)}
                  disabled={busySlug === p.slug}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-surface-border bg-white/[0.03] px-3 py-2.5 text-xs font-semibold text-zinc-200 transition hover:border-accent/40 disabled:opacity-50"
                >
                  {busySlug === p.slug ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4 text-accent" />
                  )}
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRunPlatform(p.slug)
                    setKeyword('')
                    setRunMsg(null)
                    setRunOpen(true)
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-xs font-semibold text-black transition hover:bg-accent-muted"
                >
                  <Play className="h-4 w-4" />
                  Run scraper
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {runMsg ? (
        <div className="rounded-xl border border-surface-border bg-surface-raised px-4 py-3 text-xs text-zinc-400">
          {runMsg}
        </div>
      ) : null}

      <Modal open={runOpen} title="Run scraper" onClose={() => setRunOpen(false)}>
        <div className="space-y-4 text-sm">
          <p className="text-zinc-500">
            Platform <span className="font-mono text-accent">{runPlatform}</span>. Requires a saved session
            (Login).
          </p>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Keyword</label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-surface-border bg-black/50 px-3 py-2.5 text-white outline-none focus:border-accent/40"
              placeholder="Search keyword"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Max leads</label>
              <input
                type="number"
                min={1}
                max={scraper.max_leads_cap}
                value={maxLeads}
                onChange={(e) => setMaxLeads(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-surface-border bg-black/50 px-3 py-2.5 text-white outline-none focus:border-accent/40"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Delay min (s)</label>
              <input
                type="number"
                step="0.5"
                min={1}
                value={delayMin}
                onChange={(e) => setDelayMin(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-surface-border bg-black/50 px-3 py-2.5 text-white outline-none focus:border-accent/40"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Delay max (s)</label>
              <input
                type="number"
                step="0.5"
                min={1}
                value={delayMax}
                onChange={(e) => setDelayMax(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-surface-border bg-black/50 px-3 py-2.5 text-white outline-none focus:border-accent/40"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRunOpen(false)}
              className="rounded-xl border border-surface-border px-4 py-2 text-sm text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!keyword.trim() || busySlug !== null}
              onClick={() => void onRun()}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-muted disabled:opacity-50"
            >
              {busySlug ? 'Running…' : 'Start run'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
