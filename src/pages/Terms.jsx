import PageShell from '../components/PageShell'
import PageModule from '../components/PageModule'

export default function Terms() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Terms of Service"
      subtitle="Preliminary platform usage terms for ForgePass LA MVP access and early testing."
    >
      <PageModule>
        <div className="space-y-10 text-white/70">
          <section>
            <h2 className="text-2xl font-bold text-white">
              Platform Status
            </h2>

            <p className="mt-4 leading-8">
              ForgePass LA is currently an early-stage platform under active
              development. Features, availability, infrastructure, and
              platform functionality may change without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Acceptable Use
            </h2>

            <p className="mt-4 leading-8">
              Users may not attempt to abuse, disrupt, reverse engineer,
              overload, scrape, or interfere with platform infrastructure,
              routing systems, waitlist systems, analytics systems, or
              future account systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Availability
            </h2>

            <p className="mt-4 leading-8">
              ForgePass LA does not currently guarantee uninterrupted
              platform availability, uptime, event accuracy, route accuracy,
              or operational continuity during MVP and testing stages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Intellectual Property
            </h2>

            <p className="mt-4 leading-8">
              ForgePass LA branding, platform systems, visual assets,
              infrastructure, architecture, and platform concepts remain
              protected platform property unless otherwise stated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Limitation of Liability
            </h2>

            <p className="mt-4 leading-8">
              ForgePass LA is provided on an "as-is" and "as-available"
              basis during current MVP and testing phases. Platform operators
              are not responsible for losses, interruptions, inaccuracies,
              or operational issues arising from platform use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Future Services
            </h2>

            <p className="mt-4 leading-8">
              Future platform features may include accounts, analytics,
              personalization systems, event systems, rewards systems,
              notifications, mapping infrastructure, and operational tools.
              Additional terms may apply to future functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Terms Status
            </h2>

            <p className="mt-4 leading-8">
              These terms represent preliminary MVP-stage platform terms
              and should later be reviewed and finalized with qualified
              legal counsel before broader public rollout.
            </p>
          </section>
        </div>
      </PageModule>
    </PageShell>
  )
}