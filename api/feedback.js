import { verifyTurnstileToken } from './_lib/turnstile.js'
import { checkRateLimit, getClientIp } from './_lib/rateLimit.js'
import {
  isValidEmail,
  validateFeedbackPayload,
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

import { handleCors } from './_lib/cors.js'

export default async function handler(request, response) {
  if (handleCors(request, response, 'POST')) return
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'POST') {
    return response.status(405).json({
      error: 'Method not allowed',
    })
  }

  const clientIp = getClientIp(request)

  const rateLimit = checkRateLimit({
    key: `feedback:${clientIp}`,
    limit: 5,
    windowMs: 60_000,
  })

  if (!rateLimit.allowed) {
    response.setHeader('Retry-After', String(Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))))
    return response.status(429).json({
      error: 'Too many requests. Please try again shortly.',
    })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const {
      turnstileToken,
    } = request.body || {}

    const {
      name,
      email,
      category,
      message,
    } = validateFeedbackPayload(request.body || {})

    if (!name) {
      return response.status(400).json({
        error: 'Enter your name.',
      })
    }

    if (!isValidEmail(email)) {
      return response.status(400).json({
        error: 'Enter a valid email address.',
      })
    }

    if (!message) {
      return response.status(400).json({
        error: 'Enter feedback before submitting.',
      })
    }

    const remoteIp =
      request.headers['x-forwarded-for']?.split(',')[0]?.trim()

    const turnstileResult = await verifyTurnstileToken(
      turnstileToken,
      remoteIp,
      controller.signal,
    )

    if (turnstileResult?.success !== true) {
      return response.status(403).json({
        error: 'Security check failed.',
      })
    }

    const { url, serviceRoleKey } = getSupabaseConfig()

    const supabaseResponse = await fetch(`${url}/rest/v1/feedback`, {
      method: 'POST',
      signal: controller.signal,
      redirect: 'error',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        name,
        email,
        category,
        message,
      }),
    })

    if (!supabaseResponse.ok) {
      console.error('[api/feedback] direct supabase insert failed', {
        status: supabaseResponse.status,
      })

      return response.status(500).json({
        error: 'Feedback submission failed.',
      })
    }

    return response.status(200).json({
      ok: true,
    })
  } catch {
    return response.status(controller.signal.aborted ? 504 : 503).json({
      error: controller.signal.aborted ? 'Submission timed out. Its status could not be confirmed.' : 'Submission could not be confirmed. Please try again later.',
    })
  } finally { clearTimeout(timeout) }
}
