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

export default async function handler(request, response) {
  if (!validateAdminAccess(request)) {
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
    } = request.body || {}

    if (!feedbackId) {
      return response.status(400).json({
        error: 'Missing feedback id.',
      })
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return response.status(400).json({
        error: 'Invalid status.',
      })
    }

    const { url, serviceRoleKey } = getSupabaseConfig()

    const updateResponse = await fetch(
      `${url}/rest/v1/feedback?id=eq.${feedbackId}`,
      {
        method: 'PATCH',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
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

    return response.status(200).json({
      ok: true,
    })
  } catch (error) {
    return response.status(500).json({
      error: error.message || 'Unexpected server error.',
    })
  }
}