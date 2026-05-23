import PageShell from '../components/PageShell'
import PageModule from '../components/PageModule'
import StatusBadge from '../components/StatusBadge'
import ContentSection from '../components/ContentSection'

const statusItems = [
  {
    title: 'Production Deployment',
    status: 'Online',
    detail: 'Vercel deployment, GitHub workflow, environment variables, and live Supabase connection are active.',
  },
  {
    title: 'Waitlist System',
    status: 'Online',
    detail: 'Public form submits to Supabase with duplicate handling and production persistence.',
  },
  {
    title: 'Frontend Architecture',
    status: 'Online',
    detail: 'Routing, reusable layouts, shared components, filters, search, mobile nav, and config-driven pages are complete.',
  },
  {
    title: 'SEO Foundation',
    status: 'Online',
    detail: 'Metadata, social preview image, sitemap, robots.txt, favicon assets, and route titles are in place.',
  },
  {
    title: 'User Accounts',
    status: 'Building',
    detail: 'Authentication, profiles, onboarding, saved places, and personalization are future-phase systems.',
  },
  {
    title: 'Live City Data',
    status: 'Planned',
    detail: 'Events, maps, transit, crowd awareness, alerts, and realtime feeds are not yet connected.',
  },
]

export default function Status() {
  return (
    <PageShell
      eyebrow="Build Status"
      title="ForgePass LA Status"
      subtitle="Internal progress tracker for MVP infrastructure, frontend architecture, backend readiness, and upcoming platform systems."
    >
      <ContentSection
        title="Production Readiness"
        subtitle="Current operational state of the ForgePass LA platform."
      >
        <PageModule>
          <div className="grid gap-6 md:grid-cols-2">
            {statusItems.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-black/20 p-6"
              >
                <StatusBadge status={item.status} />

                <h2 className="text-2xl font-bold">
                  {item.title}
                </h2>

                <p className="mt-4 leading-7 text-white/55">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </PageModule>
      </ContentSection>
    </PageShell>
  )
}