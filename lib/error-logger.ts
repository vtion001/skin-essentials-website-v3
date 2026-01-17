import { supabaseAdminClient } from './supabase-admin'
import { sendSlackAlert } from './slack-service'

export async function logError(context: string, error: unknown, meta?: Record<string, any>) {
  // 1. Prepare Payload
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : null
  const payload = {
    context,
    message,
    stack,
    meta: meta || null,
    created_at: new Date().toISOString(),
  }

  // 2. Log to Database (Primary)
  try {
    const supabase = supabaseAdminClient()
    if (supabase) {
      await supabase.from('error_logs').insert(payload)
    } else {
      console.warn("Supabase admin client not initialized, skipping DB log")
    }
  } catch (err) {
    console.error("Failed to write to error_logs:", err)
  }

  // 3. Send to Slack (Secondary / Async)
  // Only send if it's not a minor warning (optional filtering could go here)
  try {
    // We don't await this to avoid blocking the request
    sendSlackAlert(`[${context}] ${message}`, { stack, meta }).catch(e => console.error(e));
  } catch { 
    // Ignore slack errors
  }
}
