import { verifyTurnstileToken } from './_lib/turnstile.js'

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase server environment variables.')
  }

  const keyPayload = decodeJwtPayload(serviceRoleKey)

  console.error('[api/waitlist] supabase key payload', {
    ref: keyPayload?.ref,
    role: keyPayload?.role,
  })

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
        name: name.trim(),
        email: normalizedEmail,
        city: city.trim(),
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
        detail: errorText,
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