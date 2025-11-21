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
      sourcePlatform,
      influencerId,
      influencerName,
      referralCode,
      discountApplied,
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
      source_platform: sourcePlatform ?? 'website',
      influencer_id: influencerId ?? null,
      influencer_name: influencerName ?? null,
      referral_code: referralCode ?? null,
      discount_applied: Boolean(discountApplied ?? false),
  })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
    try {
      if (email) {
        const details = {
          to: email,
          subject: `Your Appointment is Scheduled: ${service}`,
          html: `<div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937">`+
                `<h2 style="margin:0 0 12px;font-size:20px;color:#111827">Thank you, ${name}</h2>`+
                `<p style="margin:0 0 12px">Your booking has been received.</p>`+
                `<p style="margin:0 0 12px"><strong>Service:</strong> ${service}</p>`+
                `<p style="margin:0 0 12px"><strong>Date:</strong> ${date}</p>`+
                `<p style="margin:0 0 12px"><strong>Time:</strong> ${time}</p>`+
                `<p style="margin:16px 0 0">If you need to make changes, reply to this email.</p>`+
                `</div>`
        }
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send', payload: details })
        }).catch(() => {})
      }
    } catch {}

    return NextResponse.json({ success: true, id: appointmentId })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}