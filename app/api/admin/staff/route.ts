import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"

export async function GET() {
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('staff').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ staff: data || [] })
}

export async function POST(req: Request) {
  const body = await req.json()
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('staff').insert(body).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ staff: data })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { id, ...updates } = body || {}
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('staff').update(updates).eq('id', id).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ staff: data })
}

export async function DELETE(req: Request) {
  const body = await req.json()
  const { id } = body || {}
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const admin = supabaseAdminClient()
  const { error } = await admin.from('staff').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}