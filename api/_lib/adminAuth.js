import { createSupabaseAdminClient } from './supabaseAdmin.js'

export async function validateAdminAccess(request) {
  const header = request.headers?.authorization
  if (typeof header !== 'string' || !/^Bearer \S+$/i.test(header)) return false
  const token = header.slice(7)
  try {
    const client = createSupabaseAdminClient()
    // Validate with Auth; never trust a decoded JWT or client-supplied role.
    const { data, error } = await client.auth.getUser(token)
    if (error || !data?.user?.id) return false
    const result = await client.from('admin_roles')
      .select('role').eq('user_id', data.user.id).maybeSingle()
    return !result.error && result.data?.role === 'administrator'
  } catch {
    return false
  }
}
