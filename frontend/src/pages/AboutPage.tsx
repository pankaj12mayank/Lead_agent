import { useBrandingStore } from '@/store/brandingStore'

export function AboutPage() {
  const name = useBrandingStore((s) => s.branding.product_name)
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">About</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{name}</h1>
        <p className="text-base leading-relaxed text-ink-muted">
          Lead management, sales pipeline tracking, and outreach analytics in one workspace for teams that prioritize
          conversion optimization and disciplined prospecting.
        </p>
      </header>

      <section className="rounded-2xl border border-surface-border bg-premium-card-light p-8 shadow-card dark:bg-premium-card-dark">
        <h2 className="type-section-heading text-base">Frequently asked questions</h2>
        <dl className="mt-6 space-y-5 text-sm text-ink-muted">
          <div>
            <dt className="font-medium text-ink">What is LeadPilot used for?</dt>
            <dd className="mt-1 leading-relaxed">
              Teams use it for lead generation, CRM-style lead tracking, sales outreach preparation, and sales analytics
              across a single prospect database.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ink">How does prospecting connect to the CRM views?</dt>
            <dd className="mt-1 leading-relaxed">
              Connected lead sources populate your workspace so you can apply lead scoring, monitor pipeline status, and
              measure customer acquisition outcomes without switching tools.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Who is the platform designed for?</dt>
            <dd className="mt-1 leading-relaxed">
              Business owners, agencies, recruiters, consultants, sales teams, startups, and enterprise operators who
              need disciplined contact management and reporting.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Where can I review performance?</dt>
            <dd className="mt-1 leading-relaxed">
              Use the CRM dashboard for operational KPIs and the analytics workspace for conversion rate analysis, funnel
              review, and source effectiveness.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
