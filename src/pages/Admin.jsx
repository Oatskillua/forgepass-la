import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/PageShell'
import AdminMetricsSection from '../components/admin/AdminMetricsSection'
import { useAuth } from '../auth/AuthContext'
import { apiFetch } from '../lib/apiFetch'

export default function Admin() {
  const { session, loading } = useAuth()
  const token = session?.access_token
  return (
    <PageShell eyebrow="Operations" title="Admin Dashboard" subtitle="Restricted account access for platform administrators.">
      {loading ? <p role="status">Checking session…</p>
        : !token ? <Link to="/auth" state={{ from: '/admin' }} className="text-cyan-200 underline">Sign in with your administrator account</Link>
        : <AdminAccess key={token} token={token} />}
    </PageShell>
  )
}

function AdminAccess({ token }) {
  const [verifiedToken, setVerifiedToken] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    apiFetch('/api/admin-metrics', {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
      cache: 'no-store',
    }).then(async (response) => {
      if (!response.ok) throw new Error('Administrator access is unavailable or not authorized.')
      const data = await response.json()
      if (![data.waitlistCount, data.feedbackCount].every((count) => Number.isInteger(count) && count >= 0)) {
        throw new Error('Administrator verification returned an invalid response. Please retry.')
      }
      if (!controller.signal.aborted) {
        setError('')
        setVerifiedToken(token)
      }
    }).catch((failure) => {
      if (!controller.signal.aborted) {
        setVerifiedToken(null)
        setError(failure.message)
      }
    })
    return () => controller.abort()
  }, [token, attempt])

  return (
    verifiedToken === token ? <AdminMetricsSection accessToken={token} />
      : error ? <div><p role="alert" className="text-red-300">{error}</p><button className="mt-4 rounded-xl border border-white/15 px-4 py-2" onClick={() => { setError(''); setAttempt((value) => value + 1) }}>Retry administrator access</button></div>
      : <p role="status">Verifying administrator access…</p>
  )
}
