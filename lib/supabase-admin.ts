import { createClient } from '@supabase/supabase-js'

export function supabaseAdminClient() {
  const url = String(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '')
  return createClient(url, key)
}