import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/apiFetch'

export default function AdminWaitlistSection({ accessToken }) {
  return <WaitlistEntries key={accessToken} accessToken={accessToken} />
}

function WaitlistEntries({ accessToken }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function loadWaitlist() {
      try {
        const response = await apiFetch('/api/admin-waitlist', {
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
          setErrorMessage(data.error || 'Unable to load waitlist entries.')
          return
        }

        if (!Array.isArray(data.entries)) throw new Error('Unable to confirm waitlist entries. Please retry.')
        setEntries(data.entries)
      } catch (error) {
        if (active) {
          setErrorMessage(error.message || 'Unable to load waitlist entries.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadWaitlist()

    return () => {
      active = false
      controller.abort()
    }
  }, [accessToken, attempt])

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="text-2xl font-bold text-white">
        Latest Waitlist Entries
      </h2>

      <p className="mt-4 leading-7 text-white/60">
        Most recent 25 alpha waitlist submissions.
      </p>

      <button disabled={loading} onClick={() => {
        setLoading(true); setErrorMessage(''); setEntries([]); setAttempt((value) => value + 1)
      }} className="mt-4 rounded-xl border border-white/15 px-4 py-2 text-sm disabled:opacity-40">Refresh waitlist</button>

      {loading && (
        <p role="status" className="mt-6 text-sm font-semibold text-white/50">
          Loading waitlist entries...
        </p>
      )}

      {errorMessage && (
        <p role="alert" className="mt-6 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm font-semibold text-red-200">
          {errorMessage}
        </p>
      )}

      {!loading && !errorMessage && entries.length === 0 && (
        <p className="mt-6 text-sm font-semibold text-white/50">
          No waitlist entries yet.
        </p>
      )}

      {!loading && !errorMessage && entries.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-white/50">
              <tr>
                <th className="border-b border-white/10 px-4 py-3">Name</th>
                <th className="border-b border-white/10 px-4 py-3">Email</th>
                <th className="border-b border-white/10 px-4 py-3">City</th>
                <th className="border-b border-white/10 px-4 py-3">Interest</th>
                <th className="border-b border-white/10 px-4 py-3">Created</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="text-white/70">
                  <td className="border-b border-white/5 px-4 py-4">
                    {entry.name || '—'}
                  </td>
                  <td className="border-b border-white/5 px-4 py-4">
                    {entry.email}
                  </td>
                  <td className="border-b border-white/5 px-4 py-4">
                    {entry.city || '—'}
                  </td>
                  <td className="border-b border-white/5 px-4 py-4">
                    {entry.interest || '—'}
                  </td>
                  <td className="border-b border-white/5 px-4 py-4">
                    {entry.created_at
                      ? new Date(entry.created_at).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
