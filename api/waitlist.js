import { verifyTurnstileToken } from './_lib/turnstile.js'
import { createSupabaseAdminClient } from './_lib/supabaseAdmin.js'

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({
      error: 'Method not allowed',
    })
  }

  try {
    const {
      name = '',
      email = '',
      city = '',
      interest = 'Events',
      turnstileToken,
    } = request.body || {}

    const normalizedEmail = email.trim().toLowerCase()

    if (!isValidEmail(normalizedEmail)) {
      return response.status(400).json({
        error: 'Enter a valid email address.',
      })
    }

    const remoteIp =
      request.headers['x-forwarded-for']?.split(',')[0]?.trim()

    const turnstileResult = await verifyTurnstileToken(
      turnstileToken,
      remoteIp,
    )

    if (!turnstileResult.success) {
      return response.status(403).json({
        error: 'Security check failed.',
      })
    }

    const supabase = createSupabaseAdminClient()

    const { error } = await supabase.from('waitlist').insert([
      {
        name: name.trim(),
        email: normalizedEmail,
        city: city.trim(),
        interest,
      },
    ])

    if (error) {
      if (error.code === '23505') {
        return response.status(409).json({
          error: 'This email is already on the waitlist.',
          code: error.code,
        })
      }

      return response.status(500).json({
        error: error.message || 'Submission failed.',
        code: error.code,
      })
    }

    return response.status(200).json({
      ok: true,
    })
  } catch (error) {
    return response.status(500).json({
      error: error.message || 'Unexpected server error.',
    })
  }
}