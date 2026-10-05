import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../../lib/apiFetch'
import Badge from '../Badge'
import { adminMetricLinks } from '../../data/adminMetrics'
import AdminWaitlistSection from './AdminWaitlistSection'
import AdminFeedbackSection from './AdminFeedbackSection'

export default function AdminMetricsSection({ accessToken }) {
  const [metrics, setMetrics] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const exportRequest = useRef(null)

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function loadMetrics() {
      try {
        const response = await apiFetch('/api/admin-metrics', {
          signal: controller.signal,
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        const data = await response.json()

        if (!active) {
          return
        }

        if (!response.ok) {
          setErrorMessage(data.error || 'Unable to load admin metrics.')
          return
        }

        if (![data.waitlistCount, data.feedbackCount].every((count) => Number.isInteger(count) && count >= 0)) {
          throw new Error('Unable to confirm admin counts. Please refresh.')
        }
        setMetrics(data)
      } catch (error) {
        if (active) {
          setErrorMessage(error.message || 'Unable to load admin metrics.')
        }
      } finally { if (active) setLoading(false) }
    }

    loadMetrics()

    return () => {
      active = false
      controller.abort()
      exportRequest.current?.abort()
    }
  }, [accessToken, attempt])

  const downloadExport = async (endpoint, filename) => {
    if (exportRequest.current) return
    const controller = new AbortController()
    exportRequest.current = controller
    setExporting(true); setExportError('')
    let url
    try {
    const response = await apiFetch(endpoint, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok || !response.headers.get('content-type')?.toLowerCase().startsWith('text/csv')) throw new Error('Export failed')

    const blob = await response.blob()
    if (controller.signal.aborted) return
    url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = filename
    link.click()

    } catch {
      if (!controller.signal.aborted) setExportError('The CSV export could not be downloaded. Please retry.')
    } finally {
      if (url) window.URL.revokeObjectURL(url)
      exportRequest.current = null
      if (!controller.signal.aborted) setExporting(false)
    }
  }

  const exportWaitlist = () => {
    downloadExport('/api/admin-export-waitlist', 'forgepass-waitlist.csv')
  }

  const exportFeedback = () => {
    downloadExport('/api/admin-export-feedback', 'forgepass-feedback.csv')
  }

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
          <p role="alert" className="mt-5 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm font-semibold text-red-200">
            {errorMessage}
          </p>
        )}
        {loading && <p role="status" className="mt-4">Loading admin metrics…</p>}
        <button disabled={loading || exporting} onClick={() => {
          setLoading(true); setMetrics(null); setErrorMessage(''); setAttempt((value) => value + 1)
        }} className="mt-4 rounded-xl border border-white/15 px-4 py-2 disabled:opacity-40">Refresh metrics</button>
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

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={exportWaitlist}
            disabled={exporting}
            className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-black transition hover:scale-[1.02]"
          >
            Export Waitlist CSV
          </button>

          <button
            type="button"
            onClick={exportFeedback}
            disabled={exporting}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:scale-[1.02]"
          >
            Export Feedback CSV
          </button>
        </div>
        {exporting && <p role="status" className="mt-4">Preparing CSV download…</p>}
        {exportError && <p role="alert" className="mt-4 text-red-300">{exportError}</p>}
      </section>

      <AdminWaitlistSection accessToken={accessToken} />
      <AdminFeedbackSection accessToken={accessToken} />
    </div>
  )
}
