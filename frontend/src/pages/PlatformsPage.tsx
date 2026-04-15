import { KeyRound, Loader2, Play, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Modal } from '@/components/ui/Modal'
import { fetchScraperStatus, fetchSession, openManualLogin, runScraper, type ScraperStatus } from '@/lib/api/scraper'
import { createPlatform, deletePlatform, listPlatforms } from '@/lib/api/platforms'
import { SEO_FOOTER_LINKS } from '@/lib/copy/appCopy'
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
  const [addOpen, setAddOpen] = useState(false)
  const [addSlug, setAddSlug] = useState('')
  const [addLabel, setAddLabel] = useState('')
  const [addBusy, setAddBusy] = useState(false)
  const [addErr, setAddErr] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PlatformRow | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteErr, setDeleteErr] = useState<string | null>(null)

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

  async function onAddPlatform() {
    setAddErr(null)
    const slug = addSlug.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    const label = addLabel.trim()
    if (!slug || !label) {
      setAddErr('Enter a short slug (letters, numbers, underscores) and a display name.')
      return
    }
    setAddBusy(true)
    try {
      await createPlatform({ slug, label })
      setAddOpen(false)
      setAddSlug('')
      setAddLabel('')
      await load()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      setAddErr(err.response?.data?.detail || 'Could not add this platform. Try a different slug.')
    } finally {
      setAddBusy(false)
    }
  }

  async function onConfirmDelete() {
    if (!deleteTarget?.platform_id) return
    setDeleteErr(null)
    setDeleteBusy(true)
    try {
      await deletePlatform(deleteTarget.platform_id)
      setDeleteTarget(null)
      await load()
    } catch {
      setDeleteErr('Could not remove this platform. Try again.')
    } finally {
      setDeleteBusy(false)
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
      setRunMsg(err.response?.data?.detail || 'Lead search could not be completed. Verify session access and try again.')
    } finally {
      setBusySlug(null)
    }
  }

  if (loading || !scraper) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading platform configuration
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <section className="space-y-3">
        <h2 className="type-section-heading">Platform access</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-ink-muted">
          Review connected lead sources, session management state, and scraper limits. Engine{' '}
          <span className="text-ink">{scraper.engine}</span>. Maximum leads per run{' '}
          <span className="text-ink">{scraper.max_leads_cap}</span>. Default delay window{' '}
          <span className="text-ink">
            {scraper.delay_seconds_range[0]} to {scraper.delay_seconds_range[1]} seconds
          </span>
          .
        </p>
        <button
          type="button"
          onClick={() => load()}
          className="inline-flex items-center gap-2 rounded-xl border border-surface-border px-4 py-2 text-sm text-ink-muted transition hover:border-amber-500/30 hover:text-ink"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh status
        </button>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="type-section-heading mb-0">Connected lead sources</h2>
            <p className="mt-2 max-w-3xl text-xs text-ink-muted">
              Connect a platform session before running scraping activity. Built-in sources cannot be removed; custom
              platforms use the same card layout and support delete after confirmation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAddErr(null)
              setAddSlug('')
              setAddLabel('')
              setAddOpen(true)
            }}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-amber-500/25 transition hover:from-amber-500 hover:to-amber-600 dark:from-amber-500 dark:to-amber-600"
          >
            <Plus className="h-4 w-4" />
            Add platform
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((p) => {
          const sess = sessions[p.slug]
          const loggedIn = !!sess?.has_session
          return (
            <div
              key={p.slug}
              className="flex flex-col rounded-2xl border border-surface-border bg-premium-card-light p-6 shadow-card transition hover:border-amber-500/20 dark:bg-premium-card-dark dark:hover:border-amber-400/15"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight text-ink">{p.label}</h3>
                  <p className="mt-1 font-mono text-xs text-ink-subtle">{p.slug}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    p.active ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-500',
                  )}
                >
                  {p.active ? 'Active' : 'Off'}
                </span>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-muted">Platform session</dt>
                  <dd className={loggedIn ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-200'}>
                    {loggedIn ? 'Connected' : 'Not connected'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-muted">Built-in connector</dt>
                  <dd className="text-ink-muted">{p.builtin ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onManualLogin(p.slug)}
                    disabled={busySlug === p.slug}
                    className="inline-flex min-h-[40px] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-surface-border bg-field/80 px-3 py-2.5 text-xs font-semibold text-ink transition hover:border-amber-500/30 disabled:opacity-50 dark:bg-zinc-900/50"
                  >
                    {busySlug === p.slug ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                    )}
                    Connect Platform
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRunPlatform(p.slug)
                      setKeyword('')
                      setRunMsg(null)
                      setRunOpen(true)
                    }}
                    className="inline-flex min-h-[40px] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-3 py-2.5 text-xs font-semibold text-white shadow-sm ring-1 ring-amber-500/25 transition hover:from-amber-500 hover:to-amber-600 dark:from-amber-500 dark:to-amber-600"
                  >
                    <Play className="h-4 w-4" />
                    Start Lead Search
                  </button>
                </div>
                {!p.builtin && p.platform_id != null ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteErr(null)
                      setDeleteTarget(p)
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/35 bg-red-500/5 px-3 py-2 text-xs font-semibold text-red-800 transition hover:border-red-500/50 hover:bg-red-500/10 dark:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete platform
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
        </div>
      </section>

      {runMsg ? (
        <div className="rounded-xl border border-surface-border bg-surface-raised/80 px-4 py-3 text-xs text-ink-muted dark:bg-zinc-900/40">
          {runMsg}
        </div>
      ) : null}

      <Modal open={addOpen} title="Add platform" onClose={() => !addBusy && setAddOpen(false)}>
        <div className="space-y-4 text-sm">
          <p className="text-ink-muted">
            Custom platforms appear in this list with the same details as built-in sources. Use a short{' '}
            <span className="text-ink">slug</span> (lowercase, underscores) and a clear label for your team.
          </p>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted" htmlFor="add-platform-slug">
              Slug
            </label>
            <input
              id="add-platform-slug"
              value={addSlug}
              onChange={(e) => setAddSlug(e.target.value)}
              className="field-input mt-1 font-mono text-sm"
              placeholder="e.g. custom_directory"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted" htmlFor="add-platform-label">
              Display name
            </label>
            <input
              id="add-platform-label"
              value={addLabel}
              onChange={(e) => setAddLabel(e.target.value)}
              className="field-input mt-1"
              placeholder="e.g. Custom Directory"
            />
          </div>
          {addErr ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-800 dark:text-red-200">
              {addErr}
            </div>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={addBusy}
              onClick={() => setAddOpen(false)}
              className="rounded-xl border border-surface-border px-4 py-2 text-sm text-ink-muted transition hover:text-ink disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={addBusy || !addSlug.trim() || !addLabel.trim()}
              onClick={() => void onAddPlatform()}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
            >
              {addBusy ? 'Saving…' : 'Add platform'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Remove platform?"
        onClose={() => !deleteBusy && setDeleteTarget(null)}
      >
        <div className="space-y-4 text-sm">
          <p className="text-ink-muted">
            This removes <span className="font-semibold text-ink">{deleteTarget?.label}</span>{' '}
            <span className="font-mono text-xs text-ink-subtle">({deleteTarget?.slug})</span> from your workspace list.
            Existing leads that reference this source are not deleted.
          </p>
          {deleteErr ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-800 dark:text-red-200">
              {deleteErr}
            </div>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={deleteBusy}
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-surface-border px-4 py-2 text-sm text-ink-muted transition hover:text-ink disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteBusy}
              onClick={() => void onConfirmDelete()}
              className="rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-500/25 dark:text-red-200"
            >
              {deleteBusy ? 'Removing…' : 'Delete platform'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={runOpen} title="Scraping activity" onClose={() => setRunOpen(false)}>
        <div className="space-y-4 text-sm">
          <p className="text-ink-muted">
            Platform <span className="font-mono text-amber-800 dark:text-amber-300">{runPlatform}</span>. A saved
            platform session is required before starting lead collection.
          </p>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Search keyword</label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="field-input mt-1"
              placeholder="Role, industry, or company focus"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Lead limit</label>
              <input
                type="number"
                min={1}
                max={scraper.max_leads_cap}
                value={maxLeads}
                onChange={(e) => setMaxLeads(Number(e.target.value))}
                className="field-input mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Minimum delay (s)</label>
              <input
                type="number"
                step="0.5"
                min={1}
                value={delayMin}
                onChange={(e) => setDelayMin(Number(e.target.value))}
                className="field-input mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Maximum delay (s)</label>
              <input
                type="number"
                step="0.5"
                min={1}
                value={delayMax}
                onChange={(e) => setDelayMax(Number(e.target.value))}
                className="field-input mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRunOpen(false)}
              className="rounded-xl border border-surface-border px-4 py-2 text-sm text-ink-muted transition hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!keyword.trim() || busySlug !== null}
              onClick={() => void onRun()}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
            >
              {busySlug ? 'Running' : 'Start Lead Search'}
            </button>
          </div>
        </div>
      </Modal>

      <section className="rounded-2xl border border-surface-border bg-premium-card-light p-6 shadow-card dark:bg-premium-card-dark">
        <h2 className="type-section-heading mb-4">Product topics</h2>
        <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Product topics">
          {SEO_FOOTER_LINKS.map(({ to, label }) => (
            <Link
              key={`${to}-${label}`}
              to={to}
              className="text-sm text-ink-muted underline-offset-4 transition hover:text-ink hover:underline"
            >
              {label}
            </Link>
          ))}
        </nav>
      </section>
    </div>
  )
}
