import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/PageShell'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'

export default function UpdatePassword() {
  const { user, loading } = useAuth()
  return <PasswordRecovery key={user?.id || 'anonymous'} user={user} loading={loading} />
}

function PasswordRecovery({ user, loading }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)
  const lock = useRef(false)

  async function submit(event) {
    event.preventDefault()
    if (lock.current || loading || !user || complete) return
    setError('')
    if (password.length < 8 || password !== confirmation) {
      setError('Use at least eight characters and enter matching passwords.')
      return
    }
    lock.current = true
    setBusy(true)
    try {
      const result = await supabase.auth.updateUser({ password })
      if (result.error) throw result.error
      setPassword('')
      setConfirmation('')
      setComplete(true)
    } catch (failure) {
      setError(failure.message || 'Unable to update your password. Request a new recovery link.')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  return (
    <PageShell eyebrow="Account recovery" title="Choose a new password" subtitle="Use the recovery link from your email to restore access.">
      {loading ? <p role="status">Checking recovery session…</p> : !user ? (
        <p role="alert">Your recovery session is missing or expired. <Link to="/auth" state={{ mode: 'reset' }} className="underline">Request a new link</Link>.</p>
      ) : complete ? (
        <p role="status">Password updated. <Link to="/app" className="underline">Open your account</Link>.</p>
      ) : (
        <form onSubmit={submit} className="mx-auto max-w-lg space-y-5 rounded-3xl border border-white/10 p-6">
          <fieldset disabled={busy} className="space-y-5">
          <label className="block">New password<input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl bg-white/10 p-3" /></label>
          <label className="block">Confirm password<input type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="mt-2 w-full rounded-xl bg-white/10 p-3" /></label>
          {error && <p role="alert" className="text-red-300">{error}</p>}
          <button disabled={busy} className="rounded-xl bg-cyan-300 px-5 py-3 font-bold text-black disabled:opacity-50">{busy ? 'Updating…' : 'Update password'}</button>
          </fieldset>
        </form>
      )}
    </PageShell>
  )
}
