import { useEffect, useState } from 'react'

import { getSettings, patchSettings } from '@/lib/api/settings'
import type { AppSettings } from '@/types/models'

const MODEL_PRESETS = [
  { value: 'llama3', label: 'Llama 3' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'deepseek-r1', label: 'DeepSeek R1' },
  { value: 'custom', label: 'Custom…' },
]

function str(v: unknown) {
  return v === undefined || v === null ? '' : String(v)
}

function boolish(v: unknown, fallback: boolean) {
  if (v === undefined || v === null || v === '') return fallback
  return String(v).toLowerCase() === 'true' || v === true || v === 1 || v === '1'
}

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [modelPreset, setModelPreset] = useState('llama3')
  const [modelCustom, setModelCustom] = useState('')
  const [useOllama, setUseOllama] = useState(true)
  const [freeApi, setFreeApi] = useState(false)
  const [delayMin, setDelayMin] = useState(3)
  const [delayMax, setDelayMax] = useState(5)
  const [maxLeads, setMaxLeads] = useState(20)
  const [exportsDir, setExportsDir] = useState('')
  const [notes, setNotes] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await getSettings()
        if (!cancelled) {
          setSettings(s)
          const mn = str(s.model_name) || 'llama3'
          const preset = MODEL_PRESETS.find((p) => p.value === mn)?.value
          if (preset && preset !== 'custom') {
            setModelPreset(preset)
            setModelCustom('')
          } else {
            setModelPreset('custom')
            setModelCustom(mn)
          }
          setUseOllama(boolish(s.use_ollama, true))
          setFreeApi(boolish(s.free_api_mode, false))
          setDelayMin(Number(s.scraper_delay_min_seconds ?? 3) || 3)
          setDelayMax(Number(s.scraper_delay_max_seconds ?? 5) || 5)
          setMaxLeads(Number(s.scraper_max_leads_default ?? 20) || 20)
          setExportsDir(str(s.exports_dir))
          setNotes(str(s.notes))
        }
      } catch {
        if (!cancelled) setMsg('Unable to load settings. Refresh the page and try again.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setBusy(true)
    try {
      const modelName = modelPreset === 'custom' ? modelCustom.trim() : modelPreset
      const next = await patchSettings({
        model_name: modelName || undefined,
        use_ollama: useOllama ? 'true' : 'false',
        free_api_mode: freeApi ? 'true' : 'false',
        scraper_delay_min_seconds: delayMin,
        scraper_delay_max_seconds: delayMax,
        scraper_max_leads_default: maxLeads,
        exports_dir: exportsDir.trim() || undefined,
        notes: notes || undefined,
      })
      setSettings(next)
      setMsg('Settings saved successfully.')
    } catch {
      setMsg('Unable to save settings. Verify your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  if (!settings) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-ink-muted">
        Loading workspace settings
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <form onSubmit={onSave} className="space-y-8">
        <section className="rounded-2xl border border-surface-border bg-premium-card-light p-8 shadow-card dark:bg-premium-card-dark">
          <h2 className="type-panel-title mb-2">AI message configuration</h2>
          <p className="text-xs leading-relaxed text-ink-muted">
            Controls how outreach messages are generated for sales teams using your connected model runtime.
          </p>
          <div className="mt-6 space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted" htmlFor="preset">
                Model preset
              </label>
              <select
                id="preset"
                value={modelPreset}
                onChange={(e) => setModelPreset(e.target.value)}
                className="field-input mt-2"
              >
                {MODEL_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            {modelPreset === 'custom' ? (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted" htmlFor="custom">
                  Custom model tag
                </label>
                <input
                  id="custom"
                  value={modelCustom}
                  onChange={(e) => setModelCustom(e.target.value)}
                  className="field-input mt-2"
                  placeholder="e.g. llama3:latest"
                />
              </div>
            ) : null}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-surface-border bg-field/60 px-4 py-3 dark:bg-zinc-900/40">
                <input
                  type="checkbox"
                  checked={useOllama}
                  onChange={(e) => setUseOllama(e.target.checked)}
                  className="h-4 w-4 rounded border-surface-border bg-field text-amber-700 accent-amber-600 focus:ring-amber-500/30 dark:text-amber-400"
                />
                <span className="text-sm text-ink-muted">Use Ollama for AI message generation</span>
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-surface-border bg-field/60 px-4 py-3 dark:bg-zinc-900/40">
                <input
                  type="checkbox"
                  checked={freeApi}
                  onChange={(e) => setFreeApi(e.target.checked)}
                  className="h-4 w-4 rounded border-surface-border bg-field text-amber-700 accent-amber-600 focus:ring-amber-500/30 dark:text-amber-400"
                />
                <span className="text-sm text-ink-muted">Free API mode (skip model generation)</span>
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-surface-border bg-premium-card-light p-8 shadow-card dark:bg-premium-card-dark">
          <h2 className="type-panel-title mb-2">Delay and safety settings</h2>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            Workspace defaults for prospecting cadence and batch size. Individual runs can still override delays from
            platform or lead search dialogs.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Minimum delay (s)</label>
              <input
                type="number"
                step="0.5"
                min={1}
                value={delayMin}
                onChange={(e) => setDelayMin(Number(e.target.value))}
                className="field-input mt-2"
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
                className="field-input mt-2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Default lead limit</label>
              <input
                type="number"
                min={1}
                max={50}
                value={maxLeads}
                onChange={(e) => setMaxLeads(Number(e.target.value))}
                className="field-input mt-2"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-surface-border bg-premium-card-light p-8 shadow-card dark:bg-premium-card-dark">
          <h2 className="type-panel-title mb-2">Export preferences</h2>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            Lead export files use the server export pipeline. Optional directory notes help operators align deployments
            with your data retention policy.
          </p>
          <div className="mt-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted" htmlFor="exports">
              Exports directory (optional note)
            </label>
            <input
              id="exports"
              value={exportsDir}
              onChange={(e) => setExportsDir(e.target.value)}
              className="field-input mt-2"
              placeholder="exports"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-surface-border bg-premium-card-light p-8 shadow-card dark:bg-premium-card-dark">
          <h2 className="type-panel-title mb-2">Account settings</h2>
          <p className="text-xs leading-relaxed text-ink-muted">
            Internal documentation for administrators. Not shown to prospects or external contacts.
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="field-input mt-4"
          />
        </section>

        {msg ? <p className="text-sm text-ink-muted">{msg}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="btn-primary px-6 py-3 text-sm disabled:opacity-50"
        >
          {busy ? 'Saving' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
