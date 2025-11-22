import { NextRequest, NextResponse } from "next/server"
import { jsonMasked } from "@/lib/admin-mask"
import { supabaseAdminClient } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const admin = supabaseAdminClient()
    const { data, error } = await admin
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return jsonMasked({ error: error.message }, { status: 500 })
    return jsonMasked({ appointments: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const admin = supabaseAdminClient()
    const payload = {
      id: body.id || `apt_${Date.now()}`,
      client_id: body.client_id ?? body.clientId ?? '',
      client_name: body.client_name ?? body.clientName ?? '',
      client_email: body.client_email ?? body.clientEmail ?? '',
      client_phone: body.client_phone ?? body.clientPhone ?? '',
      service: body.service,
      date: body.date,
      time: body.time,
      status: body.status ?? 'scheduled',
      notes: body.notes ?? '',
      duration: body.duration ?? 60,
      price: body.price ?? 0,
      created_at: body.created_at,
      updated_at: body.updated_at,
    }
    const { data, error } = await admin.from('appointments').insert(payload).select('*').single()
    if (error) return jsonMasked({ ok: false, error: error.message }, { status: 500 })
    return jsonMasked({ ok: true, appointment: data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, updates } = body || {}
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 })
    const admin = supabaseAdminClient()
    const normalized = {
      client_id: updates?.client_id ?? updates?.clientId,
      client_name: updates?.client_name ?? updates?.clientName,
      client_email: updates?.client_email ?? updates?.clientEmail,
      client_phone: updates?.client_phone ?? updates?.clientPhone,
      service: updates?.service,
      date: updates?.date,
      time: updates?.time,
      status: updates?.status,
      notes: updates?.notes,
      duration: updates?.duration,
      price: updates?.price,
      updated_at: updates?.updated_at,
    }
    const { data, error } = await admin.from('appointments').update(normalized).eq('id', id).select('*').single()
    if (error) return jsonMasked({ ok: false, error: error.message }, { status: 500 })
    return jsonMasked({ ok: true, appointment: data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    let id = searchParams.get('id')
    if (!id) {
      try {
        const parsed = await req.json()
        id = parsed?.id || null
      } catch {}
    }
    if (!id) return jsonMasked({ ok: false, error: 'Missing id' }, { status: 400 })
    const admin = supabaseAdminClient()
    const { error } = await admin.from('appointments').delete().eq('id', id)
    if (error) return jsonMasked({ ok: false, error: error.message }, { status: 500 })
    return jsonMasked({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}