import { validateAdminAccess } from './_lib/adminAuth.js'

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
  if (!validateAdminAccess(request)) {
    return response.status(401).json({
      error: 'Unauthorized.',
    })
  }

  try {
    const { url, serviceRoleKey } = getSupabaseConfig()

    const supabaseResponse = await fetch(
      `${url}/rest/v1/feedback?select=id,name,email,category,message,status,created_at&order=created_at.desc&limit=25`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if (!supabaseResponse.ok) {
      return response.status(500).json({
        error: 'Failed to load feedback entries.',
      })
    }

    const entries = await supabaseResponse.json()

    return response.status(200).json({
      entries,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return response.status(500).json({
      error: error.message || 'Unexpected server error.',
    })
  }
}