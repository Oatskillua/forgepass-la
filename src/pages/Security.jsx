import PageShell from '../components/PageShell'
import PageModule from '../components/PageModule'
import Badge from '../components/Badge'

export default function Security() {
  return (
    <PageShell
      eyebrow="Security"
      title="Security Disclosure"
      subtitle="Security posture, vulnerability reporting expectations, and platform hardening status for ForgePass LA."
    >
      <PageModule>
        <div className="space-y-10 text-white/70">
          <section>
            <Badge tone="cyan" className="mb-5">
              MVP Security Program
            </Badge>

            <h2 className="text-2xl font-bold text-white">
              Security Commitment
            </h2>

            <p className="mt-4 leading-8">
              ForgePass LA is being developed with security-first infrastructure practices,
              controlled backend access, environment protection, row-level security,
              and staged production hardening.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Current Protection Layers
            </h2>

            <p className="mt-4 leading-8">
              Current safeguards include Supabase row-level security, public insert-only
              waitlist access, protected environment variables, duplicate submission
              constraints, error fallback handling, and structured analytics instrumentation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Vulnerability Reporting
            </h2>

            <p className="mt-4 leading-8">
              Formal security reporting channels are planned before broader public rollout.
              During the MVP stage, security reporting procedures are still being finalized.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              Future Hardening
            </h2>

            <p className="mt-4 leading-8">
              Planned protections include abuse prevention, bot mitigation, rate limiting,
              expanded monitoring, authentication hardening, admin access controls, and
              operational incident response procedures.
            </p>
          </section>
        </div>
      </PageModule>
    </PageShell>
  )
}