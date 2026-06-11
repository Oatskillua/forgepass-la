import { validateAdminAccess } from './_lib/adminAuth.js'

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase server environment variables.')
  }

  return { url, serviceRoleKey }
}

function escapeCsv(value) {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

function rowsToCsv(rows) {
  const headers = ['id', 'name', 'email', 'city', 'interest', 'created_at']

  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((header) => escapeCsv(row[header])).join(','),
    ),
  ]

  return lines.join('\n')
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
      `${url}/rest/v1/waitlist?select=id,name,email,city,interest,created_at&order=created_at.desc`,
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
        error: 'Failed to export waitlist.',
      })
    }

    const rows = await supabaseResponse.json()
    const csv = rowsToCsv(rows)

    response.setHeader('Content-Type', 'text/csv; charset=utf-8')
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="forgepass-waitlist.csv"',
    )

    return response.status(200).send(csv)
  } catch (error) {
    return response.status(500).json({
      error: error.message || 'Unexpected server error.',
    })
  }
}