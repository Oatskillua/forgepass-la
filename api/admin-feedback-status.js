import { validateAdminAccess } from './_lib/adminAuth.js'

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase server environment variables.')
  }

  return { url, serviceRoleKey }
}

const ALLOWED_STATUSES = [
  'new',
  'reviewed',
  'planned',
  'completed',
  'dismissed',
]

import { handleCors } from './_lib/cors.js'

export default async function handler(request, response) {
  if (handleCors(request, response, 'PATCH')) return
  response.setHeader('Cache-Control', 'no-store')
  if (!await validateAdminAccess(request)) {
    return response.status(401).json({
      error: 'Unauthorized.',
    })
  }

  if (request.method !== 'PATCH') {
    return response.status(405).json({
      error: 'Method not allowed',
    })
  }

  try {
    const {
      feedbackId,
      status,
      expectedStatus,
    } = request.body || {}

    if (typeof feedbackId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(feedbackId)) {
      return response.status(400).json({
        error: 'Invalid feedback id.',
      })
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return response.status(400).json({
        error: 'Invalid status.',
      })
    }
    if (expectedStatus !== null && !ALLOWED_STATUSES.includes(expectedStatus)) {
      return response.status(400).json({ error: 'The original feedback status is required.' })
    }

    const { url, serviceRoleKey } = getSupabaseConfig()

    const query = new URLSearchParams({ id: `eq.${feedbackId}`, select: 'id,status' })
    query.set('status', expectedStatus === null ? 'is.null' : `eq.${expectedStatus}`)
    const updateResponse = await fetch(
      `${url}/rest/v1/feedback?${query}`,
      {
        method: 'PATCH',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          status,
        }),
      },
    )

    if (!updateResponse.ok) {
      return response.status(500).json({
        error: 'Failed to update feedback status.',
      })
    }

    const updated = await updateResponse.json()
    if (Array.isArray(updated) && updated.length === 0) {
      return response.status(409).json({ error: 'Feedback changed or is no longer available. Refresh before updating again.' })
    }
    if (!Array.isArray(updated) || updated.length !== 1 || String(updated[0].id) !== feedbackId || updated[0].status !== status) {
      return response.status(502).json({ error: 'Feedback update could not be confirmed. Refresh to check its status.' })
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
