import PageShell from '../components/PageShell'
import PageModule from '../components/PageModule'
import Badge from '../components/Badge'

export default function Feedback() {
  return (
    <PageShell
      eyebrow="Tester Feedback"
      title="Alpha Feedback"
      subtitle="Controlled tester feedback intake for ForgePass LA MVP evaluation and operational improvement."
    >
      <PageModule>
        <div className="space-y-10 text-white/70">
          <section>
            <Badge tone="cyan" className="mb-5">
              Controlled Alpha Intake
            </Badge>

            <h2 className="text-2xl font-bold text-white">
              Platform Feedback System
            </h2>

            <p className="mt-4 leading-8">
              ForgePass LA is preparing structured feedback collection systems
              for controlled alpha testers, onboarding evaluation, usability
              review, operational testing, and infrastructure validation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Planned Feedback Categories
            </h2>

            <ul className="mt-6 space-y-3 text-white/60">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                <span>User experience and navigation clarity</span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                <span>Mobile responsiveness and usability</span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                <span>Discovery and event platform usefulness</span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                <span>Performance and stability observations</span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                <span>Bug reporting and operational issues</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Current Status
            </h2>

            <p className="mt-4 leading-8">
              Live tester onboarding and production feedback submission systems
              are still being finalized prior to controlled public alpha access.
            </p>
          </section>
        </div>
      </PageModule>
    </PageShell>
  )
}