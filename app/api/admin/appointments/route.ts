import { NextRequest, NextResponse } from "next/server"
import { jsonMaybeMasked } from "@/lib/admin-mask"
import { supabaseAdminClient } from "@/lib/supabase-admin"
import { createMessageReminder } from "@/lib/iprogsms"

export async function GET(req: NextRequest) {
  try {
    const admin = supabaseAdminClient()
    const { data, error } = await admin
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })
    return jsonMaybeMasked(req, { appointments: data || [] })
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
    if (error) return jsonMaybeMasked(req, { ok: false, error: error.message }, { status: 500 })

    // Send SMS Confirmation
    if (payload.client_phone) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
      const msg = `Hi ${payload.client_name}, your appointment on ${payload.date} at ${payload.time} is confirmed. Reply YES to acknowledge.`
      fetch(`${baseUrl}/api/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: payload.client_phone, message: msg })
      }).catch(err => console.error("Failed to send admin appointment SMS", err))
    }

    // Schedule Reminders (24h, 3h, 1h)
    if (payload.client_phone && payload.date && payload.time) {
      try {
        const apptTime = new Date(`${payload.date}T${payload.time}:00`)
        const now = new Date()

        // 24h
        const time24 = new Date(apptTime.getTime() - 24 * 60 * 60 * 1000)
        if (time24 > now) {
          const msg = `Hello ${payload.client_name}, this is a gentle reminder for your appointment with Skin Essentials on ${payload.date} at ${payload.time}. See you soon!`
          createMessageReminder(payload.client_phone, msg, time24).catch(console.error)
        }

        // 3h
        const time3 = new Date(apptTime.getTime() - 3 * 60 * 60 * 1000)
        if (time3 > now) {
          const msg = `Hi ${payload.client_name}, seeing you in 3 hours for your ${payload.service || 'appointment'} at Skin Essentials today at ${payload.time}!`
          createMessageReminder(payload.client_phone, msg, time3).catch(console.error)
        }

        // 1h
        const time1 = new Date(apptTime.getTime() - 1 * 60 * 60 * 1000)
        if (time1 > now) {
          const msg = `Hi ${payload.client_name}, just a quick reminder! Your appointment is in 1 hour (${payload.time}). We're ready for you!`
          createMessageReminder(payload.client_phone, msg, time1).catch(console.error)
        }
      } catch (e) { console.error("Scheduling admin appointment error", e) }
    }

    return jsonMaybeMasked(req, { ok: true, appointment: data })
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
    if (error) return jsonMaybeMasked(req, { ok: false, error: error.message }, { status: 500 })
    return jsonMaybeMasked(req, { ok: true, appointment: data })
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
      } catch { }
    }
    if (!id) return jsonMaybeMasked(req, { ok: false, error: 'Missing id' }, { status: 400 })
    const admin = supabaseAdminClient()
    const { error } = await admin.from('appointments').delete().eq('id', id)
    if (error) return jsonMaybeMasked(req, { ok: false, error: error.message }, { status: 500 })
    return jsonMaybeMasked(req, { ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}