import { useState } from 'react'

import PageShell from '../components/PageShell'
import PageModule from '../components/PageModule'
import AdminMetricsSection from '../components/admin/AdminMetricsSection'
import { getAdminAccessCode } from '../lib/adminAccess'

export default function Admin() {
  const [accessCode, setAccessCode] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const expectedCode = getAdminAccessCode()

  const onSubmit = (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!expectedCode) {
      setErrorMessage('Admin access is not configured.')
      return
    }

    if (accessCode.trim() !== expectedCode) {
      setErrorMessage('Invalid admin access code.')
      return
    }

    setUnlocked(true)
    setAccessCode('')
  }

  return (
    <PageShell
      eyebrow="Operations"
      title="Admin Dashboard"
      subtitle="Internal ForgePass LA alpha operations, intake visibility, and system monitoring."
    >
      <PageModule>
        {!unlocked ? (
          <form
            onSubmit={onSubmit}
            className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8"
          >
            <h2 className="text-2xl font-bold text-white">
              Admin Access Required
            </h2>

            <p className="mt-4 leading-7 text-white/60">
              Enter the internal access code to view alpha operations metrics.
            </p>

            <input
              type="password"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder="Admin access code"
              className="mt-6 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-white outline-none"
            />

            {errorMessage && (
              <p className="mt-4 text-sm font-semibold text-red-300">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="mt-6 w-full rounded-2xl bg-cyan-300 py-4 font-bold text-black transition hover:scale-[1.02]"
            >
              Unlock Admin Dashboard
            </button>
          </form>
        ) : (
          <AdminMetricsSection />
        )}
      </PageModule>
    </PageShell>
  )
}