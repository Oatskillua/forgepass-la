import { useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import PageShell from '../components/PageShell'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'
import { getPublicWebOrigin } from '../lib/publicWebOrigin'

const modes = {
  login: { title: 'Welcome back', action: 'Sign in' },
  signup: { title: 'Create your ForgePass', action: 'Create account' },
  reset: { title: 'Reset your password', action: 'Send reset link' },
}

export default function Auth() {
  const location = useLocation()
  const [mode, setMode] = useState(() => location.state?.mode === 'reset' ? 'reset' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const destination = ['/app', '/app/saved', '/app/itineraries', '/app/profile', '/app/rewards', '/app/alerts', '/admin'].includes(location.state?.from)
    ? location.state.from : '/app'

  if (loading) return <p role="status">Checking your session…</p>

  if (user) {
    return <Navigate to={destination} replace />
  }

  const submit = async (event) => {
    event.preventDefault()
    if (submitLock.current) return
    if (mode === 'signup' && !fullName.trim()) { setError('Enter your name.'); return }
    submitLock.current = true
    setError('')
    setMessage('')
    setSubmitting(true)

    try {
      if (mode === 'reset') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: `${getPublicWebOrigin()}/auth/update-password` },
        )
        if (resetError) throw resetError
        setMessage('Password-reset instructions were sent if the account exists.')
      } else if (mode === 'signup') {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() } },
        })
        if (signupError) throw signupError

        if (data.session) {
          navigate(destination, { replace: true })
        } else {
          setMessage('Check your email to verify your account.')
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (loginError) throw loginError
        navigate(destination, { replace: true })
      }
    } catch (submitError) {
      setError(submitError.message || 'Authentication failed.')
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  const changeMode = (nextMode) => {
    if (submitLock.current) return
    setMode(nextMode)
    setError('')
    setMessage('')
    setPassword('')
  }

  return (
    <PageShell
      eyebrow="ForgePass Account"
      title={modes[mode].title}
      subtitle="Save places, build itineraries, track rewards, and manage city alerts."
    >
      <form onSubmit={submit} className="mx-auto max-w-lg space-y-5 rounded-3xl border border-white/10 bg-white/5 p-8">
        <fieldset disabled={submitting} className="space-y-5">
        {mode === 'signup' && (
          <label className="block text-sm font-semibold text-white/80">
            Full name
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              maxLength={120}
              required
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-white outline-none focus:border-cyan-300"
            />
          </label>
        )}

        <label className="block text-sm font-semibold text-white/80">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-white outline-none focus:border-cyan-300"
          />
        </label>

        {mode !== 'reset' && (
          <label className="block text-sm font-semibold text-white/80">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={mode === 'signup' ? 8 : undefined}
              required
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-white outline-none focus:border-cyan-300"
            />
          </label>
        )}

        {error && <p role="alert" className="text-sm font-semibold text-red-300">{error}</p>}
        {message && <p role="status" className="text-sm font-semibold text-emerald-300">{message}</p>}

        <button disabled={submitting} className="w-full rounded-2xl bg-cyan-300 py-4 font-bold text-black disabled:opacity-60">
          {submitting ? 'Working…' : modes[mode].action}
        </button>

        <div className="flex flex-wrap justify-center gap-4 text-sm">
          {mode !== 'login' && <button type="button" onClick={() => changeMode('login')} className="text-cyan-200">Sign in</button>}
          {mode !== 'signup' && <button type="button" onClick={() => changeMode('signup')} className="text-cyan-200">Create account</button>}
          {mode !== 'reset' && <button type="button" onClick={() => changeMode('reset')} className="text-white/60">Forgot password?</button>}
        </div>
        </fieldset>
      </form>
    </PageShell>
  )
}
