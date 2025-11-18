import { supabaseAdminClient } from './supabase-admin'

export async function logError(context: string, error: unknown, meta?: Record<string, any>) {
  try {
    const supabase = supabaseAdminClient()
    const payload = {
      context,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      meta: meta || null,
      created_at: new Date().toISOString(),
    }
    await supabase.from('error_logs').insert(payload)
  } catch {}
}