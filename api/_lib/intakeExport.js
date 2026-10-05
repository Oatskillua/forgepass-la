const columns = {
  waitlist: ['id', 'name', 'email', 'city', 'interest', 'created_at'],
  feedback: ['id', 'name', 'email', 'category', 'message', 'status', 'created_at'],
}
export function intakeColumns(table) {
  if (!Object.hasOwn(columns, table)) throw new Error('Unsupported export table.')
  return columns[table]
}
function headers(key) {
  return { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' }
}
function totalFrom(response) {
  const match = response.headers.get('content-range')?.match(/\/(\d+)$/)
  if (!match || !Number.isSafeInteger(Number(match[1]))) throw new Error('Database did not confirm the record count.')
  return Number(match[1])
}

export async function intakeCount(url, key, table) {
  intakeColumns(table)
  const response = await fetch(`${url}/rest/v1/${table}?select=id`, {
    method: 'HEAD', headers: headers(key), signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error('Unable to count intake records.')
  return totalFrom(response)
}

export async function loadIntakeExport(url, key, table) {
  const selected = intakeColumns(table)
  const rows = []
  const ids = new Set()
  const cutoff = new Date().toISOString()
  const signal = AbortSignal.timeout(20000)
  let total = null
  let bytes = 0
  while (total === null || rows.length < total) {
    const query = new URLSearchParams({ select: selected.join(','), order: 'id.asc',
      created_at: `lte.${cutoff}`, offset: String(rows.length), limit: '250' })
    const response = await fetch(`${url}/rest/v1/${table}?${query}`, { headers: headers(key), signal })
    if (!response.ok) throw new Error('Export failed while loading records. No partial export was produced.')
    const nextTotal = totalFrom(response)
    if (nextTotal > 10000) throw new Error('Export exceeds 10,000 records. Use a managed database export.')
    if (total !== null && total !== nextTotal) throw new Error('Records changed during export. Please retry.')
    total = nextTotal
    const page = await response.json()
    if (!Array.isArray(page) || (page.length === 0 && rows.length < total)) throw new Error('Export page incomplete. Please retry.')
    for (const row of page) {
      if (row?.id == null || ids.has(String(row.id))) throw new Error('Export contains missing or repeated record IDs. Please retry.')
      ids.add(String(row.id))
    }
    bytes += Buffer.byteLength(JSON.stringify(page), 'utf8')
    if (bytes > 3_000_000) throw new Error('Export is too large for a download. Use a managed database export.')
    rows.push(...page)
    if (rows.length > total) throw new Error('Export count mismatch. Please retry.')
  }
  return rows
}
