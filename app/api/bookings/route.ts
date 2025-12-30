import { NextRequest, NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"
import { createMessageReminder } from "@/lib/iprogsms"

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
    if (!admin) {
      return NextResponse.json({ success: false, error: "Database client unavailable" }, { status: 500 })
    }

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

    // --- GUARDRAIL: Duplicate Booking Check ---
    const { data: existingAppt } = await admin
      .from('appointments')
      .select('id')
      .eq('date', date)
      .eq('time', time)
      .maybeSingle()

    if (existingAppt) {
      return NextResponse.json({
        success: false,
        error: "This time slot is already booked. Please choose another time or date.",
        code: "SLOT_TAKEN"
      }, { status: 409 })
    }
    // ------------------------------------------

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
    } catch { }

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
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
      // Send Email
      if (email) {
        const details = {
          to: email,
          subject: `Your Appointment is Scheduled: ${service}`,
          html: `<div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937">` +
            `<h2 style="margin:0 0 12px;font-size:20px;color:#111827">Thank you, ${name}</h2>` +
            `<p style="margin:0 0 12px">Your booking has been received.</p>` +
            `<p style="margin:0 0 12px"><strong>Service:</strong> ${service}</p>` +
            `<p style="margin:0 0 12px"><strong>Date:</strong> ${date}</p>` +
            `<p style="margin:0 0 12px"><strong>Time:</strong> ${time}</p>` +
            `<p style="margin:16px 0 0">If you need to make changes, reply to this email.</p>` +
            `</div>`
        }
        await fetch(`${baseUrl}/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send', payload: details })
        }).catch(() => { })
      }

      // Send SMS Confirmation
      if (phone) {
        const { sendSms } = await import("@/lib/sms-service")
        const msg = `Hi ${name}, your appointment on ${date} at ${time} is confirmed. Reply YES to acknowledge.`
        await sendSms(phone, msg).catch(console.error)
      }

      // Send Viber Admin Notification
      try {
        const { notifyNewBookingViber } = await import("@/lib/viber-service")
        await notifyNewBookingViber({
          client_name: name,
          client_email: email,
          client_phone: phone,
          service,
          date,
          time,
          price
        }).catch(err => console.error("Viber notification failed", err))
      } catch (e) {
        console.error("Viber import/execution error", e)
      }

      // Schedule Reminders (24h, 3h, 1h)
      if (phone && date && time) {
        try {
          const apptTime = new Date(`${date}T${time}:00`)
          const now = new Date()

          // 24h
          const time24 = new Date(apptTime.getTime() - 24 * 60 * 60 * 1000)
          if (time24 > now) {
            const msg = `Hello ${name}, this is a gentle reminder for your appointment with Skin Essentials on ${date} at ${time}. See you soon!`
            createMessageReminder(phone, msg, time24).catch(console.error)
          }

          // 3h
          const time3 = new Date(apptTime.getTime() - 3 * 60 * 60 * 1000)
          if (time3 > now) {
            const msg = `Hi ${name}, seeing you in 3 hours for your ${service} at Skin Essentials today at ${time}!`
            createMessageReminder(phone, msg, time3).catch(console.error)
          }

          // 1h
          const time1 = new Date(apptTime.getTime() - 1 * 60 * 60 * 1000)
          if (time1 > now) {
            const msg = `Hi ${name}, just a quick reminder! Your appointment is in 1 hour (${time}). We're ready for you!`
            createMessageReminder(phone, msg, time1).catch(console.error)
          }
        } catch (e) { console.error("Scheduling error", e) }
      }
    } catch { }

    return NextResponse.json({ success: true, id: appointmentId })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}