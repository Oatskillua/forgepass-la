import PageShell from '../components/PageShell'
import PageModule from '../components/PageModule'
import Badge from '../components/Badge'

export default function AlphaGuide() {
  return (
    <PageShell
      eyebrow="Alpha Program"
      title="Alpha Tester Guide"
      subtitle="Guidance, expectations, and testing objectives for ForgePass LA controlled alpha participants."
    >
      <PageModule>
        <div className="space-y-10 text-white/70">
          <section>
            <Badge tone="cyan" className="mb-5">
              Controlled Alpha
            </Badge>

            <h2 className="text-2xl font-bold text-white">
              Program Purpose
            </h2>

            <p className="mt-4 leading-8">
              The goal of the ForgePass LA alpha program is to validate user
              experience, platform usability, operational readiness, and system
              stability before broader public onboarding.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              What Testers Should Evaluate
            </h2>

            <ul className="mt-6 space-y-3 text-white/60">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                <span>Navigation clarity and ease of use</span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                <span>Mobile responsiveness across devices</span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                <span>Page performance and loading behavior</span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                <span>Content clarity and usefulness</span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                <span>Broken links, layout issues, or unexpected behavior</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Feedback Submission
            </h2>

            <p className="mt-4 leading-8">
              All observations, suggestions, usability concerns, bugs, and
              feature requests should be submitted through the platform feedback
              system located at the Feedback page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Known Limitations
            </h2>

            <p className="mt-4 leading-8">
              Realtime city intelligence, authentication, personalization,
              interactive mapping systems, notifications, and rewards
              infrastructure are not yet active during the current alpha phase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Security Expectations
            </h2>

            <p className="mt-4 leading-8">
              Testers should report bugs, errors, and unexpected behavior
              through approved feedback channels. Deliberate abuse, disruption,
              automated scraping, or attempts to bypass platform controls are
              prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Alpha Disclaimer
            </h2>

            <p className="mt-4 leading-8">
              ForgePass LA remains under active development. Features,
              infrastructure, content, and functionality may change, reset, or
              be temporarily unavailable as the platform evolves.
            </p>
          </section>
        </div>
      </PageModule>
    </PageShell>
  )
}