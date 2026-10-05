import { useRef, useState } from 'react'
import { Trophy } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'

import { analyticsEvents } from '../config/analyticsEvents'
import { trackEvent } from '../lib/analytics'
import { getTurnstileSiteKey } from '../lib/turnstile'

import { submitIntake } from '../lib/submitIntake'

export default function WaitlistForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')

  const lock = useRef(false)
  const [challengeVersion, setChallengeVersion] = useState(0)
  const siteKey = getTurnstileSiteKey()

  const [form, setForm] = useState({
    name: '',
    email: '',
    city: '',
    interest: 'Events',
  })

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (lock.current) return

    setErrorMessage('')
    setSubmitted(false)

    if (!isValidEmail(form.email.trim())) {
      setErrorMessage('Enter a valid email address.')
      return
    }

    if (siteKey && !turnstileToken) {
      setErrorMessage('Complete the security check before submitting.')
      return
    }

    lock.current = true
    setLoading(true)
    try {
      await submitIntake('/api/waitlist', { name: form.name.trim(), email: form.email.trim().toLowerCase(), city: form.city.trim(), interest: form.interest, turnstileToken })
      setSubmitted(true)
      trackEvent(analyticsEvents.WAITLIST_JOINED, { interest: form.interest })
      setForm({ name: '', email: '', city: '', interest: 'Events' })
    } catch (failure) {
      setErrorMessage(failure.message)
      trackEvent(analyticsEvents.WAITLIST_SUBMIT_FAILED, { code: failure.status || 'connection' })
    } finally {
      lock.current = false
      setLoading(false)
      setTurnstileToken('')
      setChallengeVersion((version) => version + 1)
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="mb-6 text-3xl font-bold">
        Join the Waitlist
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          aria-label="Name"
          maxLength={100}
          disabled={loading}
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 outline-none"
        />

        <input
          type="email"
          name="email"
          aria-label="Email"
          maxLength={255}
          disabled={loading}
          placeholder="Email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 outline-none"
        />

        <input
          type="text"
          name="city"
          aria-label="City"
          maxLength={100}
          disabled={loading}
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 outline-none"
        />

        <select
          name="interest"
          aria-label="Interest"
          disabled={loading}
          value={form.interest}
          onChange={handleChange}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 outline-none"
        >
          <option>Events</option>
          <option>Nightlife</option>
          <option>Tourism</option>
          <option>Transportation</option>
          <option>Rewards</option>
        </select>

        {siteKey && (
          <Turnstile
            key={challengeVersion}
            siteKey={siteKey}
            onSuccess={setTurnstileToken}
            onExpire={() => setTurnstileToken('')}
            onError={() => setTurnstileToken('')}
          />
        )}

        {errorMessage && (
          <p role="alert" className="text-sm font-semibold text-red-300">
            {errorMessage}
          </p>
        )}

        {submitted && (
          <div role="status" className="py-6 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12" />

            <h3 className="mb-2 text-2xl font-bold">
              You're In
            </h3>

            <p className="text-white/60">
              Early access registration received.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-white py-4 font-bold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Submitting...' : 'Join Waitlist'}
        </button>
      </form>
    </div>
  )
}
