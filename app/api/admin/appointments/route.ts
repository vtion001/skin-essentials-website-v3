import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const admin = supabaseAdminClient()
    const { data, error } = await admin
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ appointments: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const raw = await req.json()
    const id = raw.id || `apt_${Date.now()}`
    const payload = {
      id,
      client_id: raw.clientId ?? raw.client_id ?? null,
      client_name: raw.clientName ?? raw.client_name ?? null,
      client_email: raw.clientEmail ?? raw.client_email ?? null,
      client_phone: raw.clientPhone ?? raw.client_phone ?? null,
      service: raw.service ?? null,
      date: raw.date ?? null,
      time: raw.time ?? null,
      status: raw.status ?? null,
      notes: raw.notes ?? null,
      duration: raw.duration ?? null,
      price: raw.price ?? null,
    }
    const admin = supabaseAdminClient()
    const { data, error } = await admin.from('appointments').insert(payload).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ appointment: data })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id } = body || {}
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const updates = {
      client_id: body.clientId ?? body.client_id,
      client_name: body.clientName ?? body.client_name,
      client_email: body.clientEmail ?? body.client_email,
      client_phone: body.clientPhone ?? body.client_phone,
      service: body.service,
      date: body.date,
      time: body.time,
      status: body.status,
      notes: body.notes,
      duration: body.duration,
      price: body.price,
      updated_at: new Date().toISOString(),
    }
    const admin = supabaseAdminClient()
    const { data, error } = await admin.from('appointments').update(updates).eq('id', id).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ appointment: data })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const admin = supabaseAdminClient()
    const { error } = await admin.from('appointments').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}