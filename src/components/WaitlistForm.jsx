import { useState } from 'react'
import { Trophy } from 'lucide-react'
import { analyticsEvents } from '../config/analyticsEvents'
import { supabase } from '../lib/supabase'
import { trackEvent } from '../lib/analytics'

export default function WaitlistForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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

    setErrorMessage('')
    setSubmitted(false)

    if (!isValidEmail(form.email)) {
      setErrorMessage('Enter a valid email address.')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('waitlist').insert([
      {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        city: form.city.trim(),
        interest: form.interest,
      },
    ])

    setLoading(false)

    if (error) {
      if (error.code === '23505') {
        trackEvent(analyticsEvents.WAITLIST_DUPLICATE_EMAIL, {
          interest: form.interest,
        })

        setErrorMessage('This email is already on the waitlist.')

        return
      }

      trackEvent(analyticsEvents.WAITLIST_SUBMIT_FAILED, {
        code: error.code,
        message: error.message,
      })

      setErrorMessage(error.message || 'Submission failed. Try again.')

      return
    }

    setSubmitted(true)

    trackEvent(analyticsEvents.WAITLIST_JOINED, {
      interest: form.interest,
      city: form.city.trim(),
    })

    setForm({
      name: '',
      email: '',
      city: '',
      interest: 'Events',
    })
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
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 outline-none"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 outline-none"
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 outline-none"
        />

        <select
          name="interest"
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

        {errorMessage && (
          <p className="text-sm font-semibold text-red-300">
            {errorMessage}
          </p>
        )}

        {submitted && (
          <div className="py-6 text-center">
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