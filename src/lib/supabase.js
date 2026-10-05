import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
let client = null
let configurationError = ''

try {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing configuration')
  const url = new URL(supabaseUrl)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('Invalid project URL')
  }
  client = createClient(supabaseUrl, supabaseAnonKey)
} catch {
  configurationError = 'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY with the intended project settings, then rebuild the app.'
}

export const supabase = client
export const supabaseConfigurationError = configurationError
