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

async function getCount(url, serviceRoleKey, table) {
  const response = await fetch(
    `${url}/rest/v1/${table}?select=id`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: 'count=exact',
      },
    },
  )

  return Number(response.headers.get('content-range')?.split('/')[1] || 0)
}

export default async function handler(request, response) {
  try {
    const { url, serviceRoleKey } = getSupabaseConfig()

    const [waitlistCount, feedbackCount] = await Promise.all([
      getCount(url, serviceRoleKey, 'waitlist'),
      getCount(url, serviceRoleKey, 'feedback'),
    ])

    return response.status(200).json({
      waitlistCount,
      feedbackCount,
      environment: process.env.VERCEL_ENV || 'unknown',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return response.status(500).json({
      error: error.message,
    })
  }
}