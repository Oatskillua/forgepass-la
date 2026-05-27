import PageShell from '../components/PageShell'
import PageModule from '../components/PageModule'
import Badge from '../components/Badge'

export default function Contact() {
  return (
    <PageShell
      eyebrow="Support"
      title="Contact"
      subtitle="Operational contact and platform communication channels for ForgePass LA."
    >
      <PageModule>
        <div className="space-y-10 text-white/70">
          <div>
            <Badge tone="cyan" className="mb-5">
              Early Stage Platform
            </Badge>

            <h2 className="text-2xl font-bold text-white">
              Platform Communication
            </h2>

            <p className="mt-4 leading-8">
              ForgePass LA is currently operating in MVP and early-access
              development stages. Official support systems, public help
              channels, and operational infrastructure are still evolving.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Current Contact Status
            </h2>

            <p className="mt-4 leading-8">
              Dedicated support email systems and public communication
              channels are planned as platform operations expand.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Security Reporting
            </h2>

            <p className="mt-4 leading-8">
              Formal security disclosure and vulnerability reporting
              procedures will be established before broader public rollout.
            </p>
          </div>
        </div>
      </PageModule>
    </PageShell>
  )
}