import { useState } from 'react'
import { Trophy } from 'lucide-react'
import { supabase } from '../lib/supabase'

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
        setErrorMessage('This email is already on the waitlist.')
        return
      }

      setErrorMessage(error.message || 'Submission failed. Try again.')
      return
    }

    setSubmitted(true)

    setForm({
      name: '',
      email: '',
      city: '',
      interest: 'Events',
    })
  }

  return (
    <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white/5 border border-white/10">
      <h2 className="text-3xl font-bold mb-6">
        Join the Waitlist
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-4 rounded-2xl bg-black/20 border border-white/10 outline-none"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-4 rounded-2xl bg-black/20 border border-white/10 outline-none"
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          className="w-full px-4 py-4 rounded-2xl bg-black/20 border border-white/10 outline-none"
        />

        <select
          name="interest"
          value={form.interest}
          onChange={handleChange}
          className="w-full px-4 py-4 rounded-2xl bg-black/20 border border-white/10 outline-none"
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
          <div className="py-6">
            <Trophy className="w-12 h-12 mx-auto mb-4" />

            <h3 className="text-2xl font-bold mb-2">
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
          className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:scale-[1.02] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Join Waitlist'}
        </button>
      </form>
    </div>
  )
}