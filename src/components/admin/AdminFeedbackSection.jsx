import { useEffect, useState } from 'react'

export default function AdminFeedbackSection({ accessCode }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true

    async function loadFeedback() {
      try {
        const response = await fetch('/api/admin-feedback', {
          headers: {
            'x-admin-access-code': accessCode,
          },
        })

        const data = await response.json()

        if (!active) {
          return
        }

        if (!response.ok) {
          setErrorMessage(data.error || 'Unable to load feedback entries.')
          return
        }

        setEntries(data.entries || [])
      } catch (error) {
        if (active) {
          setErrorMessage(error.message || 'Unable to load feedback entries.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadFeedback()

    return () => {
      active = false
    }
  }, [accessCode])

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="text-2xl font-bold text-white">
        Latest Feedback Entries
      </h2>

      <p className="mt-4 leading-7 text-white/60">
        Most recent 25 feedback submissions.
      </p>

      {loading && (
        <p className="mt-6 text-sm font-semibold text-white/50">
          Loading feedback entries...
        </p>
      )}

      {errorMessage && (
        <p className="mt-6 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm font-semibold text-red-200">
          {errorMessage}
        </p>
      )}

      {!loading && !errorMessage && entries.length === 0 && (
        <p className="mt-6 text-sm font-semibold text-white/50">
          No feedback entries yet.
        </p>
      )}

      {!loading && !errorMessage && entries.length > 0 && (
        <div className="mt-6 space-y-4">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white">
                    {entry.category || 'General Feedback'}
                  </h3>

                  <p className="mt-1 text-sm text-white/50">
                    {entry.name} · {entry.email}
                  </p>
                </div>

                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/50">
                  {entry.status || 'new'}
                </span>
              </div>

              <p className="mt-4 leading-7 text-white/70">
                {entry.message}
              </p>

              <p className="mt-4 text-xs text-white/40">
                {entry.created_at
                  ? new Date(entry.created_at).toLocaleString()
                  : '—'}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}