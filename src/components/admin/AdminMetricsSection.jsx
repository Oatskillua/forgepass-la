import { useEffect, useState } from 'react'
import Badge from '../Badge'
import { adminMetricLinks } from '../../data/adminMetrics'

export default function AdminMetricsSection() {
  const [metrics, setMetrics] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true

    async function loadMetrics() {
      try {
        const response = await fetch('/api/admin-metrics')
        const data = await response.json()

        if (!active) {
          return
        }

        if (!response.ok) {
          setErrorMessage(data.error || 'Unable to load admin metrics.')
          return
        }

        setMetrics(data)
      } catch (error) {
        if (active) {
          setErrorMessage(error.message || 'Unable to load admin metrics.')
        }
      }
    }

    loadMetrics()

    return () => {
      active = false
    }
  }, [])

  const cards = [
    {
      title: 'Waitlist',
      value: metrics?.waitlistCount ?? '—',
      detail: 'Total alpha waitlist signups.',
    },
    {
      title: 'Feedback',
      value: metrics?.feedbackCount ?? '—',
      detail: 'Total feedback submissions received.',
    },
    {
      title: 'System',
      value: metrics?.environment ?? '—',
      detail: metrics?.timestamp
        ? `Last updated ${new Date(metrics.timestamp).toLocaleString()}`
        : 'Environment and deployment status.',
    },
  ]

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

        {errorMessage && (
          <p className="mt-5 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm font-semibold text-red-200">
            {errorMessage}
          </p>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-white/10 bg-black/20 p-6"
          >
            <h3 className="text-xl font-bold text-white">
              {card.title}
            </h3>

            <p className="mt-5 text-4xl font-black text-cyan-300">
              {card.value}
            </p>

            <p className="mt-3 text-sm leading-6 text-white/50">
              {card.detail}
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