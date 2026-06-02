import { Link } from 'react-router-dom'

import PageShell from '../components/PageShell'
import PageModule from '../components/PageModule'
import Badge from '../components/Badge'

export default function AlphaLaunch() {
  return (
    <PageShell
      eyebrow="Alpha Launch"
      title="Closed Alpha Launch Command"
      subtitle="Operational checklist and command page for preparing the first controlled ForgePass LA tester group."
    >
      <PageModule>
        <div className="space-y-10 text-white/70">
          <section>
            <Badge tone="green" className="mb-5">
              90–95% Ready
            </Badge>

            <h2 className="text-2xl font-bold text-white">
              Launch Position
            </h2>

            <p className="mt-4 leading-8">
              ForgePass LA is structurally ready for a small controlled alpha
              group. Recommended first wave: 5–10 trusted testers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Before Inviting Testers
            </h2>

            <ul className="mt-6 space-y-3 text-white/60">
              <li>Confirm production site loads correctly.</li>
              <li>Confirm waitlist submissions still work.</li>
              <li>Confirm feedback submissions still work.</li>
              <li>Review Privacy, Terms, Security, and Contact pages.</li>
              <li>Review Supabase waitlist and feedback tables.</li>
              <li>Prepare tester instructions using the Alpha Guide.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Tester Flow
            </h2>

            <p className="mt-4 leading-8">
              Testers should review the homepage, explore all public sections,
              read the Alpha Guide, submit feedback, and report bugs or layout
              issues through the Feedback page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Operational Links
            </h2>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to="/alpha-guide"
                className="rounded-2xl bg-cyan-300 px-6 py-4 font-bold text-black transition hover:scale-105"
              >
                Alpha Guide
              </Link>

              <Link
                to="/feedback"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white transition hover:border-cyan-300/30 hover:text-cyan-300"
              >
                Feedback
              </Link>

              <Link
                to="/status"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white transition hover:border-cyan-300/30 hover:text-cyan-300"
              >
                Status
              </Link>

              <Link
                to="/security"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white transition hover:border-cyan-300/30 hover:text-cyan-300"
              >
                Security
              </Link>
            </div>
          </section>
        </div>
      </PageModule>
    </PageShell>
  )
}