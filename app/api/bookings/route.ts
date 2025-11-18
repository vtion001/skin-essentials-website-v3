import { NextRequest, NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      email = "",
      phone,
      service,
      date,
      time,
      notes = "",
      price = 0,
      duration = 60,
    } = body || {}

    if (!name || !phone || !date || !time || !service) {
      return NextResponse.json({ success: false, error: "Missing required booking fields" }, { status: 400 })
    }

    const admin = supabaseAdminClient()

    let clientId: string | null = null
    if (email) {
      const { data: existingByEmail } = await admin.from('clients').select('id').eq('email', email).maybeSingle()
      clientId = existingByEmail?.id ?? null
    }
    if (!clientId && phone) {
      const { data: existingByPhone } = await admin.from('clients').select('id').eq('phone', phone).maybeSingle()
      clientId = existingByPhone?.id ?? null
    }
    if (!clientId) clientId = `client_${Math.random().toString(36).slice(2)}`
    const appointmentId = `bk_${Date.now()}`

    // Upsert client (basic)
    try {
      await admin.from('clients').upsert({
        id: clientId,
        first_name: String(name).split(' ')[0] || name,
        last_name: String(name).split(' ').slice(1).join(' '),
        email,
        phone,
        source: 'website',
        status: 'active',
        total_spent: 0,
        last_visit: date,
      }, { onConflict: 'id' })
    } catch {}

    // Insert appointment
    const { error } = await admin.from('appointments').insert({
      id: appointmentId,
      client_id: clientId,
      client_name: name,
      client_email: email,
      client_phone: phone,
      service,
      date,
      time,
      status: 'scheduled',
      notes,
      duration,
      price,
    })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: appointmentId })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}