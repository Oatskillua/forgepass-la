import PageShell from '../components/PageShell'
import PageModule from '../components/PageModule'
import Badge from '../components/Badge'

export default function Health() {
  return (
    <PageShell
      eyebrow="Health Check"
      title="System Health"
      subtitle="Production verification endpoint for deployment, routing, styling, and application shell status."
    >
      <PageModule>
        <div className="space-y-6">
          <Badge tone="green">Operational</Badge>

          <div>
            <h2 className="text-2xl font-bold">
              ForgePass LA application shell is online.
            </h2>

            <p className="mt-4 text-white/55">
              Routing, layout, styling, and production deployment are responding.
            </p>
          </div>
        </div>
      </PageModule>
    </PageShell>
  )
}