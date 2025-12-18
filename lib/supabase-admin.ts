import { createClient } from '@supabase/supabase-js'

export function supabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || url === 'undefined') {
    return null
  }
  return createClient(url, key)
}