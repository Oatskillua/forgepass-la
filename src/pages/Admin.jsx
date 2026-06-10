import PageShell from '../components/PageShell'
import PageModule from '../components/PageModule'
import AdminMetricsSection from '../components/admin/AdminMetricsSection'

export default function Admin() {
  return (
    <PageShell
      eyebrow="Operations"
      title="Admin Dashboard"
      subtitle="Internal ForgePass LA alpha operations, intake visibility, and system monitoring."
    >
      <PageModule>
        <AdminMetricsSection />
      </PageModule>
    </PageShell>
  )
}