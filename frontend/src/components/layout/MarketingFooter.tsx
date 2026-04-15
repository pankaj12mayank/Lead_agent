import { APP_NAME } from '@/lib/copy/appCopy'

export function MarketingFooter() {
  return (
    <footer className="mt-16 border-t border-surface-border pt-10 pb-6">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{APP_NAME}</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
          Lead management, sales pipeline tracking, and outreach analytics in one workspace for teams that prioritize
          conversion optimization and disciplined prospecting.
        </p>

        <div className="mt-10 border-t border-surface-border pt-8">
          <h2 className="type-section-heading text-base">Frequently asked questions</h2>
          <dl className="mt-6 space-y-5 text-sm text-ink-muted">
            <div>
              <dt className="font-medium text-ink">What is LeadPilot used for?</dt>
              <dd className="mt-1 leading-relaxed">
                Teams use it for lead generation, CRM-style lead tracking, sales outreach preparation, and sales
                analytics across a single prospect database.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink">How does prospecting connect to the CRM views?</dt>
              <dd className="mt-1 leading-relaxed">
                Connected lead sources populate your workspace so you can apply lead scoring, monitor pipeline status,
                and measure customer acquisition outcomes without switching tools.
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
                Use the CRM dashboard for operational KPIs and the analytics workspace for conversion rate analysis,
                funnel review, and source effectiveness.
              </dd>
            </div>
          </dl>
        </div>

        <p className="mt-10 text-xs text-ink-subtle">
          {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
