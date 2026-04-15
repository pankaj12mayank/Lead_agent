import { useEffect, useState } from 'react'

import {
  adminClearFavicon,
  adminClearLogo,
  adminGetBranding,
  adminListUsers,
  adminPatchBranding,
  adminUploadFavicon,
  adminUploadLogo,
  type AdminUserRow,
} from '@/lib/api/admin'
import { resolveMediaUrl } from '@/lib/utils/mediaUrl'
import { useBrandingStore, type Branding } from '@/store/brandingStore'

export function AdminDashboard() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [productName, setProductName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [brandingMsg, setBrandingMsg] = useState<string | null>(null)
  const [brandingBusy, setBrandingBusy] = useState(false)
  const [footerCopyright, setFooterCopyright] = useState('')
  const [footerBusy, setFooterBusy] = useState(false)
  const [logoBusy, setLogoBusy] = useState(false)
  const [favBusy, setFavBusy] = useState(false)
  const reloadPublicBranding = useBrandingStore((s) => s.load)

  const applyBranding = (b: Partial<Branding>) => {
    if (b.product_name != null) setProductName(b.product_name || 'LeadPilot')
    if (b.logo_url !== undefined) setLogoUrl(b.logo_url || '')
    if (b.favicon_url !== undefined) setFaviconUrl(b.favicon_url || '')
    if (b.footer_copyright !== undefined) setFooterCopyright(b.footer_copyright || '')
  }

  useEffect(() => {
    let c = false
    ;(async () => {
      try {
        const [u, b] = await Promise.all([adminListUsers(), adminGetBranding()])
        if (!c) {
          setUsers(u)
          applyBranding(b)
        }
      } catch {
        if (!c) setLoadErr('Could not load admin data.')
      }
    })()
    return () => {
      c = true
    }
  }, [])

  async function saveProductName() {
    setBrandingMsg(null)
    setBrandingBusy(true)
    try {
      const b = await adminPatchBranding({
        product_name: productName.trim() || 'LeadPilot',
      })
      applyBranding(b)
      await reloadPublicBranding()
      setBrandingMsg('Product name saved.')
    } catch {
      setBrandingMsg('Could not save product name.')
    } finally {
      setBrandingBusy(false)
    }
  }

  async function saveFooterCopyright() {
    setBrandingMsg(null)
    setFooterBusy(true)
    try {
      const b = await adminPatchBranding({
        footer_copyright: footerCopyright.trim().slice(0, 280),
      })
      applyBranding(b)
      await reloadPublicBranding()
      setBrandingMsg('Footer / copyright line saved.')
    } catch {
      setBrandingMsg('Could not save footer line.')
    } finally {
      setFooterBusy(false)
    }
  }

  async function resetFooterCopyright() {
    setBrandingMsg(null)
    setFooterBusy(true)
    try {
      const b = await adminPatchBranding({ footer_copyright: '' })
      applyBranding(b)
      setFooterCopyright('')
      await reloadPublicBranding()
      setBrandingMsg('Footer reset to default (current year + product name).')
    } catch {
      setBrandingMsg('Could not reset footer line.')
    } finally {
      setFooterBusy(false)
    }
  }

  async function onLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setBrandingMsg(null)
    setLogoBusy(true)
    try {
      const b = await adminUploadLogo(f)
      applyBranding(b)
      await reloadPublicBranding()
      setBrandingMsg('Logo uploaded. Refresh the app shell to see it everywhere.')
    } catch {
      setBrandingMsg('Logo upload failed (max 2 MB; PNG, JPG, WebP, SVG, or GIF).')
    } finally {
      setLogoBusy(false)
    }
  }

  async function onFaviconFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setBrandingMsg(null)
    setFavBusy(true)
    try {
      const b = await adminUploadFavicon(f)
      applyBranding(b)
      await reloadPublicBranding()
      setBrandingMsg('Favicon uploaded.')
    } catch {
      setBrandingMsg('Favicon upload failed (max 2 MB; ICO, PNG, or SVG).')
    } finally {
      setFavBusy(false)
    }
  }

  async function clearLogo() {
    setBrandingMsg(null)
    setLogoBusy(true)
    try {
      const b = await adminClearLogo()
      applyBranding(b)
      await reloadPublicBranding()
      setBrandingMsg('Logo removed.')
    } catch {
      setBrandingMsg('Could not remove logo.')
    } finally {
      setLogoBusy(false)
    }
  }

  async function clearFavicon() {
    setBrandingMsg(null)
    setFavBusy(true)
    try {
      const b = await adminClearFavicon()
      applyBranding(b)
      await reloadPublicBranding()
      setBrandingMsg('Favicon removed.')
    } catch {
      setBrandingMsg('Could not remove favicon.')
    } finally {
      setFavBusy(false)
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Overview</h1>
        <p className="mt-1 text-sm text-ink-muted">Registered app users and public branding.</p>
      </section>

      {loadErr ? (
        <p className="text-sm text-red-600 dark:text-red-400">{loadErr}</p>
      ) : (
        <section className="rounded-2xl border border-surface-border bg-premium-card-light p-6 shadow-card dark:bg-premium-card-dark">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Registered users</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border text-xs uppercase text-ink-muted">
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">User id</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-surface-border/80">
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-ink-subtle">{u.id}</td>
                    <td className="py-2 text-ink-muted">{u.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 ? <p className="mt-4 text-sm text-ink-muted">No users yet.</p> : null}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-surface-border bg-premium-card-light p-6 shadow-card dark:bg-premium-card-dark">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Branding</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Product name, footer copyright, sidebar logo, and favicon. Logo and favicon are uploaded as files (stored on
          the API server under <span className="font-mono text-ink-subtle">storage/branding</span>).
        </p>

        <div className="mt-6 space-y-6">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted" htmlFor="bn-name">
              Product name
            </label>
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <input
                id="bn-name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="field-input max-w-md flex-1"
              />
              <button
                type="button"
                disabled={brandingBusy || footerBusy}
                onClick={() => void saveProductName()}
                className="rounded-xl border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-muted transition hover:border-amber-500/30 hover:text-ink disabled:opacity-50"
              >
                {brandingBusy ? 'Saving…' : 'Save name'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted" htmlFor="footer-copy">
              Footer / copyright line
            </label>
            <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-ink-subtle">
              Shown at the bottom of the main app shell. Leave empty and save, or use &quot;Default line&quot;, to show:{' '}
              <span className="font-mono text-ink-muted">
                {new Date().getFullYear()} {productName || 'LeadPilot'}. All rights reserved.
              </span>
              . In custom text you may use placeholders <span className="font-mono">{`{year}`}</span>,{' '}
              <span className="font-mono">{`{product_name}`}</span> (updated when the page loads).
            </p>
            <textarea
              id="footer-copy"
              value={footerCopyright}
              onChange={(e) => setFooterCopyright(e.target.value.slice(0, 280))}
              rows={2}
              maxLength={280}
              placeholder={`e.g. © ${new Date().getFullYear()} Your Company. All rights reserved.`}
              className="field-input mt-2 max-w-2xl resize-y font-mono text-sm"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={footerBusy || brandingBusy}
                onClick={() => void saveFooterCopyright()}
                className="rounded-xl border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-muted transition hover:border-amber-500/30 hover:text-ink disabled:opacity-50"
              >
                {footerBusy ? 'Saving…' : 'Save footer'}
              </button>
              <button
                type="button"
                disabled={footerBusy || brandingBusy}
                onClick={() => void resetFooterCopyright()}
                className="rounded-xl border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-muted transition hover:border-amber-500/30 hover:text-ink disabled:opacity-50"
              >
                Use default line
              </button>
            </div>
          </div>

          <div className="grid gap-6 border-t border-surface-border pt-6 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Logo</h3>
              <p className="mt-1 text-[11px] text-ink-subtle">PNG, JPG, WebP, SVG, or GIF — max 2 MB</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="btn-primary cursor-pointer px-4 py-2 text-sm disabled:opacity-50">
                  <input type="file" accept=".png,.jpg,.jpeg,.webp,.svg,.gif,image/*" className="hidden" onChange={onLogoFile} disabled={logoBusy} />
                  {logoBusy ? 'Uploading…' : 'Choose logo file'}
                </label>
                {logoUrl ? (
                  <button
                    type="button"
                    disabled={logoBusy}
                    onClick={() => void clearLogo()}
                    className="rounded-xl border border-red-500/35 px-3 py-2 text-xs font-semibold text-red-800 dark:text-red-300"
                  >
                    Remove logo
                  </button>
                ) : null}
              </div>
              {logoUrl ? (
                <div className="mt-4 flex items-center gap-3">
                  <img
                    src={resolveMediaUrl(logoUrl)}
                    alt="Logo preview"
                    className="h-14 w-14 rounded-lg border border-surface-border bg-field object-contain p-1"
                  />
                  <span className="break-all font-mono text-[10px] text-ink-subtle">{logoUrl}</span>
                </div>
              ) : (
                <p className="mt-3 text-xs text-ink-muted">No logo — default icon is used in the app.</p>
              )}
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Favicon</h3>
              <p className="mt-1 text-[11px] text-ink-subtle">ICO, PNG, or SVG — max 2 MB</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="btn-primary cursor-pointer px-4 py-2 text-sm disabled:opacity-50">
                  <input type="file" accept=".ico,.png,.svg,image/*" className="hidden" onChange={onFaviconFile} disabled={favBusy} />
                  {favBusy ? 'Uploading…' : 'Choose favicon file'}
                </label>
                {faviconUrl ? (
                  <button
                    type="button"
                    disabled={favBusy}
                    onClick={() => void clearFavicon()}
                    className="rounded-xl border border-red-500/35 px-3 py-2 text-xs font-semibold text-red-800 dark:text-red-300"
                  >
                    Remove favicon
                  </button>
                ) : null}
              </div>
              {faviconUrl ? (
                <div className="mt-4 flex items-center gap-3">
                  <img
                    src={resolveMediaUrl(faviconUrl)}
                    alt="Favicon preview"
                    className="h-10 w-10 rounded border border-surface-border bg-field object-contain p-0.5"
                  />
                  <span className="break-all font-mono text-[10px] text-ink-subtle">{faviconUrl}</span>
                </div>
              ) : (
                <p className="mt-3 text-xs text-ink-muted">No favicon — browser default is used.</p>
              )}
            </div>
          </div>
        </div>

        {brandingMsg ? <p className="mt-4 text-sm text-ink-muted">{brandingMsg}</p> : null}
      </section>
    </div>
  )
}
