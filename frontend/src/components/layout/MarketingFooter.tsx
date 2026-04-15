import { useBrandingStore } from '@/store/brandingStore'

function expandFooterPlaceholders(template: string, productName: string) {
  const y = String(new Date().getFullYear())
  return template
    .replaceAll('{year}', y)
    .replaceAll('{product_name}', productName)
    .replaceAll('{product}', productName)
}

export function MarketingFooter() {
  const name = useBrandingStore((s) => s.branding.product_name)
  const custom = useBrandingStore((s) => s.branding.footer_copyright?.trim())
  const line =
    custom && custom.length > 0
      ? expandFooterPlaceholders(custom, name)
      : `${new Date().getFullYear()} ${name}. All rights reserved.`
  return (
    <footer className="mt-16 border-t border-surface-border pt-8 pb-6">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-xs text-ink-subtle">{line}</p>
      </div>
    </footer>
  )
}
