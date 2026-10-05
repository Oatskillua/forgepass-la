import { loadIntakeExport, intakeColumns } from './_lib/intakeExport.js'
import { rowsToCsv } from './_lib/csv.js'
import { validateAdminAccess } from './_lib/adminAuth.js'

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase server environment variables.')
  }

  return { url, serviceRoleKey }
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

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { url, serviceRoleKey } = getSupabaseConfig()

    const rows = await loadIntakeExport(url, serviceRoleKey, 'feedback')
    const csv = rowsToCsv(rows, intakeColumns('feedback'))
    if (Buffer.byteLength(csv, 'utf8') > 3_500_000) throw new Error('Export is too large for a download.')

    response.setHeader('Content-Type', 'text/csv; charset=utf-8')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="forgepass-feedback.csv"',
    )

    return response.status(200).send(csv)
  } catch (error) {
    return response.status(500).json({
      error: error.message || 'Unexpected server error.',
    })
  }
}
