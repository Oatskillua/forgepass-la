import Badge from '../Badge'
import { adminMetricLinks } from '../../data/adminMetrics'

export default function AdminMetricsSection() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <Badge tone="cyan" className="mb-5">
          Internal Operations
        </Badge>

        <h2 className="text-2xl font-bold text-white">
          Admin Operations Dashboard
        </h2>

        <p className="mt-4 leading-8 text-white/60">
          Internal control surface for monitoring waitlist activity, feedback
          intake, production health, and alpha-readiness signals.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {['Waitlist', 'Feedback', 'System'].map((title) => (
          <div
            key={title}
            className="rounded-3xl border border-white/10 bg-black/20 p-6"
          >
            <h3 className="text-xl font-bold text-white">
              {title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Live metrics will be connected after protected admin access is
              finalized.
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-2xl font-bold text-white">
          Operational Links
        </h2>

        <div className="mt-6 flex flex-wrap gap-3">
          {adminMetricLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white/70 transition hover:border-cyan-300 hover:text-cyan-300"
            >
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}