import { intakeCount } from './_lib/intakeExport.js'
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

import { handleCors } from './_lib/cors.js'

export default async function handler(request, response) {
  if (handleCors(request, response, 'GET')) return
  response.setHeader('Cache-Control', 'no-store')
  if (!await validateAdminAccess(request)) {
    return response.status(401).json({
      error: 'Unauthorized.',
    })
  }

  try {
    const { url, serviceRoleKey } = getSupabaseConfig()

    const [waitlistCount, feedbackCount] = await Promise.all([
      intakeCount(url, serviceRoleKey, 'waitlist'),
      intakeCount(url, serviceRoleKey, 'feedback'),
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
