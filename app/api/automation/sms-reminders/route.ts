import { NextRequest, NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"
import { createMessageReminder } from "@/lib/iprogsms"
import { formatSms } from "@/lib/sms-templates"

function toManilaDate(dateStr: string, timeStr: string) {
  const [h, m] = (timeStr || "00:00").split(":").map((x) => Number(x))
  const dt = new Date(dateStr + "T" + (timeStr || "00:00") + ":00")
  // Adjust to Asia/Manila by reconstructing using locale string if needed,
  // but simpler if we assume server/client sync.
  // For safety, let's treat the inputs as Manila Time.
  // Actually, 'new Date' treats it as UTC or Local server time.
  // Let's stick to the previous implementation or simple construction if server is UTC.
  // Re-using previous logic:
  return new Date(dateStr + "T" + (timeStr || "00:00") + ":00")
}

export async function GET() {
  return NextResponse.json({ ok: true, info: "POST to trigger reminders. Use SMS_REMINDER_SECRET for auth." })
}

export async function POST(req: NextRequest) {
  const secret = process.env.SMS_REMINDER_SECRET || ""
  const headerSecret = req.headers.get("x-automation-secret") || ""
  if (secret && headerSecret !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  // Parse body once
  const json = await req.json().catch(() => ({}))
  const config = json.config || { dayBefore: true, threeHoursBefore: true, oneHourBefore: true }

  const admin = supabaseAdminClient()
  // Filter for appointments that are likely in the future to save DB load?
  // For now, select all is fine for small scale, but filtering by date >= today is better.
  const todayStr = new Date().toISOString().split('T')[0]
  const { data, error } = await admin.from("appointments").select("*").gte('date', todayStr)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  const list = Array.isArray(data) ? data : []
  let scheduledCount = 0
  const logs: string[] = []

  logs.push(`Found ${list.length} upcoming appointments. Scheduling reminders...`)
  const now = new Date()

  for (const a of list) {
    if (!a || !a.client_phone || !a.date || !a.time) continue
    if (!String(a.status || "scheduled").match(/scheduled|confirmed/i)) continue

    const at = toManilaDate(String(a.date), String(a.time))
    // Skip if appointment is in the past
    if (at < now) continue

    const makeMsg = (tpl: string) => {
      return tpl
        .replace(/{name}/g, a.client_name || "Valued Client")
        .replace(/{date}/g, a.date)
        .replace(/{time}/g, a.time)
        .replace(/{service}/g, a.service || "Appointment")
    }

    const clientInfo = `${a.client_name} (${a.date} ${a.time})`

    // 24h Reminder
    if (config.dayBefore) {
      const remindTime = new Date(at.getTime() - 24 * 60 * 60 * 1000)
      if (remindTime > now) {
        const msg = formatSms('REMINDER_24H', { name: a.client_name, date: a.date, time: a.time })
        logs.push(`Scheduling 24h reminder for ${clientInfo}...`)
        const res = await createMessageReminder(String(a.client_phone), msg, remindTime)
        if (res.ok) {
          scheduledCount++
          logs.push(`-> Success. Scheduled for ${remindTime.toLocaleString()}`)
        } else {
          logs.push(`-> Failed: ${JSON.stringify(res.error)}`)
        }
      }
    }

    // 3h Reminder
    if (config.threeHoursBefore) {
      const remindTime = new Date(at.getTime() - 3 * 60 * 60 * 1000)
      if (remindTime > now) {
        // Prevent scheduling if it's too close? E.g. if remindTime is in 1 minute?
        // iProg likely handles it.
        const msg = formatSms('REMINDER_3H', { name: a.client_name, service: a.service || "Appointment", time: a.time })
        logs.push(`Scheduling 3h reminder for ${clientInfo}...`)
        const res = await createMessageReminder(String(a.client_phone), msg, remindTime)
        if (res.ok) {
          scheduledCount++
          logs.push(`-> Success. Scheduled for ${remindTime.toLocaleString()}`)
        } else {
          logs.push(`-> Failed: ${JSON.stringify(res.error)}`)
        }
      }
    }

    // 1h Reminder
    if (config.oneHourBefore) {
      const remindTime = new Date(at.getTime() - 1 * 60 * 60 * 1000)
      if (remindTime > now) {
        const msg = formatSms('REMINDER_1H', { name: a.client_name, time: a.time })
        logs.push(`Scheduling 1h reminder for ${clientInfo}...`)
        const res = await createMessageReminder(String(a.client_phone), msg, remindTime)
        if (res.ok) {
          scheduledCount++
          logs.push(`-> Success. Scheduled for ${remindTime.toLocaleString()}`)
        } else {
          logs.push(`-> Failed: ${JSON.stringify(res.error)}`)
        }
      }
    }
  }

  logs.push(`Scan complete. Total reminders scheduled: ${scheduledCount}`)
  return NextResponse.json({ ok: true, sent: scheduledCount, logs })
}