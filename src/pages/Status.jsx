import PageShell from '../components/PageShell'
import PageModule from '../components/PageModule'
import StatusBadge from '../components/StatusBadge'
import ContentSection from '../components/ContentSection'
import SecurityStatusSection from '../components/status/SecurityStatusSection'
import { statusItems } from '../data/statusItems'
import OperationalStatusSection from '../components/status/OperationalStatusSection'

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
     <SecurityStatusSection />
    <OperationalStatusSection />
    </PageShell>
  )
}