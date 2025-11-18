import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdminClient } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const supabase = supabaseAdminClient()
    const { data: clients } = await supabase
      .from('clients')
      .select('*')
      .order('updated_at', { ascending: false })
    return NextResponse.json({ clients: clients || [] })
  } catch {
    return NextResponse.json({ clients: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = supabaseAdminClient()
    const body = await req.json()
    const clients = Array.isArray(body?.clients) ? body.clients : []
    if (clients.length) {
      await supabase.from('clients').upsert(clients, { onConflict: 'id' })
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to save' }, { status: 500 })
  }
}