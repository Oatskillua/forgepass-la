import { useState } from 'react'
import { MessageSquareCheck } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'

import { analyticsEvents } from '../config/analyticsEvents'
import { supabase } from '../lib/supabase'
import { trackEvent } from '../lib/analytics'
import { getTurnstileSiteKey } from '../lib/turnstile'

export default function FeedbackForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')

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

    setErrorMessage('')
    setSubmitted(false)

    if (!form.name.trim()) {
      setErrorMessage('Enter your name.')
      return
    }

    if (!isValidEmail(form.email)) {
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

    setLoading(true)

    const { error } = await supabase.from('feedback').insert([
      {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        category: form.category,
        message: form.message.trim(),
      },
    ])

    setLoading(false)

    if (error) {
      trackEvent(analyticsEvents.FEEDBACK_SUBMIT_FAILED, {
        code: error.code,
        message: error.message,
      })

      setErrorMessage(error.message || 'Feedback submission failed.')
      return
    }

    setSubmitted(true)
    setTurnstileToken('')

    trackEvent(analyticsEvents.FEEDBACK_SUBMITTED, {
      category: form.category,
    })

    setForm({
      name: '',
      email: '',
      category: 'General Feedback',
      message: '',
    })
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
          placeholder="Name"
          required
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

        <select
          name="category"
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
          placeholder="Write your feedback..."
          required
          value={form.message}
          onChange={handleChange}
          rows={6}
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-4 outline-none"
        />

        {siteKey && (
          <Turnstile
            siteKey={siteKey}
            onSuccess={setTurnstileToken}
            onExpire={() => setTurnstileToken('')}
            onError={() => setTurnstileToken('')}
          />
        )}

        {errorMessage && (
          <p className="text-sm font-semibold text-red-300">
            {errorMessage}
          </p>
        )}

        {submitted && (
          <div className="py-6 text-center">
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