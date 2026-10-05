import { useRef, useState } from 'react'
import { MessageSquareCheck } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'

import { analyticsEvents } from '../config/analyticsEvents'
import { trackEvent } from '../lib/analytics'
import { getTurnstileSiteKey } from '../lib/turnstile'

import { submitIntake } from '../lib/submitIntake'

export default function FeedbackForm() {
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
    category: 'General Feedback',
    message: '',
  })

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    })
  }

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (lock.current) return

    setErrorMessage('')
    setSubmitted(false)

    if (!form.name.trim()) {
      setErrorMessage('Enter your name.')
      return
    }

    if (!isValidEmail(form.email.trim())) {
      setErrorMessage('Enter a valid email address.')
      return
    }

    if (!form.message.trim()) {
      setErrorMessage('Enter feedback before submitting.')
      return
    }

    if (siteKey && !turnstileToken) {
      setErrorMessage('Complete the security check before submitting.')
      return
    }

    lock.current = true
    setLoading(true)
    try {
      await submitIntake('/api/feedback', { name: form.name.trim(), email: form.email.trim().toLowerCase(), category: form.category, message: form.message.trim(), turnstileToken })
      setSubmitted(true)
      trackEvent(analyticsEvents.FEEDBACK_SUBMITTED, { category: form.category })
      setForm({ name: '', email: '', category: 'General Feedback', message: '' })
    } catch (failure) {
      setErrorMessage(failure.message)
      trackEvent(analyticsEvents.FEEDBACK_SUBMIT_FAILED, { code: failure.status || 'connection' })
    } finally {
      lock.current = false
      setLoading(false)
      setTurnstileToken('')
      setChallengeVersion((version) => version + 1)
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8">
      <h2 className="mb-6 text-3xl font-bold">
        Submit Feedback
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          aria-label="Name"
          maxLength={100}
          disabled={loading}
          placeholder="Name"
          required
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

        <select
          name="category"
          aria-label="Feedback category"
          disabled={loading}
          value={form.category}
          onChange={handleChange}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 outline-none"
        >
          <option>General Feedback</option>
          <option>Bug Report</option>
          <option>Mobile Experience</option>
          <option>Navigation</option>
          <option>Feature Request</option>
          <option>Security Concern</option>
        </select>

        <textarea
          name="message"
          aria-label="Feedback"
          maxLength={5000}
          disabled={loading}
          placeholder="Write your feedback..."
          required
          value={form.message}
          onChange={handleChange}
          rows={6}
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-4 outline-none"
        />

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
            <MessageSquareCheck className="mx-auto mb-4 h-12 w-12 text-cyan-300" />

            <h3 className="mb-2 text-2xl font-bold">
              Feedback Received
            </h3>

            <p className="text-white/60">
              Thank you. Your feedback has been submitted.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-cyan-300 py-4 font-bold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  )
}
