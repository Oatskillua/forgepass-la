import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yktoolgovvenvivbxavr.supabase.co'
const supabaseAnonKey = 'sb_publishable_0lBy0tcemZkOcCNTlm8M1Q_4g_ZhB2U'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)