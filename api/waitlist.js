import { verifyTurnstileToken } from './_lib/turnstile.js'
import { checkRateLimit, getClientIp } from './_lib/rateLimit.js'
import {
  isValidEmail,
  validateWaitlistPayload,
} from './_lib/validation.js'

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase server environment variables.')
  }

  return {
    url,
    serviceRoleKey,
  }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({
      error: 'Method not allowed',
    })
  }

  const clientIp = getClientIp(request)

  const rateLimit = checkRateLimit({
    key: `waitlist:${clientIp}`,
    limit: 5,
    windowMs: 60_000,
  })

  if (!rateLimit.allowed) {
    return response.status(429).json({
      error: 'Too many requests. Please try again shortly.',
    })
  }

  try {
    const {
      turnstileToken,
    } = request.body || {}

    const {
      name,
      email,
      city,
      interest,
    } = validateWaitlistPayload(request.body || {})

    if (!isValidEmail(email)) {
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

    const { url, serviceRoleKey } = getSupabaseConfig()

    const supabaseResponse = await fetch(`${url}/rest/v1/waitlist`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        name,
        email,
        city,
        interest,
      }),
    })

    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text()

      console.error('[api/waitlist] direct supabase insert failed', {
        status: supabaseResponse.status,
        errorText,
      })

      if (supabaseResponse.status === 409 || errorText.includes('duplicate key')) {
        return response.status(409).json({
          error: 'This email is already on the waitlist.',
        })
      }

      return response.status(500).json({
        error: 'Submission failed.',
      })
    }

    return response.status(200).json({
      ok: true,
    })
  } catch (error) {
    console.error('[api/waitlist] unexpected error', {
      message: error.message,
    })

    return response.status(500).json({
      error: error.message || 'Unexpected server error.',
    })
  }
}