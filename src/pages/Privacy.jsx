import PageShell from '../components/PageShell'
import PageModule from '../components/PageModule'

export default function Privacy() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="Preliminary privacy disclosure for ForgePass LA MVP operations and early-access onboarding."
    >
      <PageModule>
        <div className="space-y-10 text-white/70">
          <section>
            <h2 className="text-2xl font-bold text-white">
              Information Collection
            </h2>

            <p className="mt-4 leading-8">
              ForgePass LA currently collects limited information submitted
              voluntarily through the waitlist and platform forms. This may
              include names, email addresses, city/location information,
              and platform-interest selections.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Usage Data
            </h2>

            <p className="mt-4 leading-8">
              The platform may collect basic analytics and interaction
              information including page visits, navigation behavior,
              engagement events, and feature interactions in order to
              improve platform performance and user experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Data Storage
            </h2>

            <p className="mt-4 leading-8">
              Submitted information is currently stored using Supabase
              infrastructure with row-level security protections and
              controlled database access policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Data Sharing
            </h2>

            <p className="mt-4 leading-8">
              ForgePass LA does not currently sell submitted user data.
              Limited infrastructure providers may process platform data
              solely for operational functionality and hosting purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Security Practices
            </h2>

            <p className="mt-4 leading-8">
              The platform is being developed with structured deployment,
              controlled environment-variable handling, row-level security,
              and production hardening practices. However, no internet-based
              platform can guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Policy Status
            </h2>

            <p className="mt-4 leading-8">
              This privacy policy is a preliminary MVP-stage disclosure and
              may be updated as ForgePass LA expands platform functionality,
              analytics systems, accounts, personalization, and operational
              infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Contact
            </h2>

            <p className="mt-4 leading-8">
              Questions regarding privacy or data handling may be directed
              through future official ForgePass LA support and contact
              channels.
            </p>
          </section>
        </div>
      </PageModule>
    </PageShell>
  )
}