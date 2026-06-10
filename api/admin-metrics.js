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

async function getRows(url, serviceRoleKey, table) {
  const response = await fetch(
    `${url}/rest/v1/${table}?select=id`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to load ${table}`)
  }

  return response.json()
}

export default async function handler(request, response) {
  try {
    const { url, serviceRoleKey } = getSupabaseConfig()

    const [waitlistRows, feedbackRows] = await Promise.all([
      getRows(url, serviceRoleKey, 'waitlist'),
      getRows(url, serviceRoleKey, 'feedback'),
    ])

    return response.status(200).json({
      waitlistCount: waitlistRows.length,
      feedbackCount: feedbackRows.length,
      environment: process.env.VERCEL_ENV || 'unknown',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return response.status(500).json({
      error: error.message,
    })
  }
}