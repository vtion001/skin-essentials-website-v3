import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const admin = supabaseAdminClient()
    const { data, error } = await admin
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ clients: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const admin = supabaseAdminClient()
    const { data, error } = await admin.from('clients').insert(body).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ client: data })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body || {}
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const admin = supabaseAdminClient()
    const { data, error } = await admin.from('clients').update(updates).eq('id', id).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ client: data })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body || {}
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const admin = supabaseAdminClient()
    const { error } = await admin.from('clients').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}