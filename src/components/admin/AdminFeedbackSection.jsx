import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../../lib/apiFetch'

const FEEDBACK_STATUSES = [
  'new',
  'reviewed',
  'planned',
  'completed',
  'dismissed',
]

export default function AdminFeedbackSection({ accessToken }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingId, setUpdatingId] = useState('')
  const [statusError, setStatusError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const lock = useRef(false)

  useEffect(() => {
    let active = true

    async function loadFeedback() {
      try {
        const response = await apiFetch('/api/admin-feedback', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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

        if (!Array.isArray(data.entries)) throw new Error('Unable to confirm feedback entries. Please retry.')
        setEntries(data.entries)
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
  }, [accessToken, attempt])

  const updateStatus = async (feedbackId, status, expectedStatus) => {
    if (lock.current || loading) return
    lock.current = true
    setUpdatingId(feedbackId)
    setStatusError('')

    try {
      const response = await apiFetch('/api/admin-feedback-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          feedbackId,
          status,
          expectedStatus,
        }),
      })

      const data = await response.json()

      if (response.status === 401 || response.status === 403) {
        setEntries([])
        setErrorMessage('Administrator access could not be verified. Refresh to check access.')
        return
      }
      if (response.status === 409) throw new Error('Feedback changed or is no longer available. Refresh feedback before updating again.')
      if (!response.ok || data.ok !== true) throw new Error('Unable to confirm the status update. Refresh feedback to check its status.')

      setEntries((currentEntries) =>
        currentEntries.map((entry) =>
          entry.id === feedbackId
            ? {
                ...entry,
                status,
              }
            : entry,
        ),
      )
    } catch (error) {
      setStatusError(error.message || 'Unable to update feedback status.')
    } finally {
      lock.current = false
      setUpdatingId('')
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="text-2xl font-bold text-white">
        Latest Feedback Entries
      </h2>

      <p className="mt-4 leading-7 text-white/60">
        Most recent 25 feedback submissions.
      </p>

      <button disabled={loading || !!updatingId} onClick={() => {
        setLoading(true); setErrorMessage(''); setStatusError(''); setAttempt((value) => value + 1)
      }} className="mt-4 rounded-xl border border-white/15 px-4 py-2 text-sm disabled:opacity-40">Refresh feedback</button>
      {statusError && <p role="alert" className="mt-4 text-red-300">{statusError}</p>}

      {loading && (
        <p role="status" className="mt-6 text-sm font-semibold text-white/50">
          Loading feedback entries...
        </p>
      )}

      {errorMessage && (
        <p role="alert" className="mt-6 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm font-semibold text-red-200">
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

                <select
                  value={entry.status || 'new'}
                  aria-label={'Status for feedback ' + entry.id}
                  disabled={!!updatingId}
                  onChange={(event) => updateStatus(entry.id, event.target.value, entry.status ?? null)}
                  className="rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs font-bold text-white/70 outline-none disabled:opacity-50"
                >
                  {FEEDBACK_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
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
