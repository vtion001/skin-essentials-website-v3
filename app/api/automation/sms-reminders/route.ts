import { NextRequest, NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"

function toManilaDate(dateStr: string, timeStr: string) {
  const [h, m] = (timeStr || "00:00").split(":").map((x) => Number(x))
  const dt = new Date(dateStr + "T" + (timeStr || "00:00") + ":00")
  // Adjust to Asia/Manila by reconstructing using locale string
  const s = dt.toLocaleString("en-US", { timeZone: "Asia/Manila" })
  return new Date(s)
}

function minutesUntil(target: Date) {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }))
  return Math.round((target.getTime() - now.getTime()) / 60000)
}

function buildMessage(kind: "day" | "three_hours" | "one_hour", appt: any) {
  const when = kind === "day" ? "tomorrow" : kind === "three_hours" ? "in 3 hours" : "in 1 hour"
  return `Reminder: Your appointment for ${appt.service} with Skin Essentials is ${when} at ${appt.time}. Reply if you need to reschedule.`
}

async function sendSms(to: string, message: string) {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/sms` : `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''}/api/sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, message }),
    })
    if (!res.ok) return false
    return true
  } catch {
    return false
  }
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
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from("appointments").select("*")
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  const list = Array.isArray(data) ? data : []
  let sent = 0
  for (const a of list) {
    if (!a || !a.client_phone || !a.date || !a.time) continue
    if (!String(a.status || "scheduled").match(/scheduled|confirmed/i)) continue
    const at = toManilaDate(String(a.date), String(a.time))
    const mins = minutesUntil(at)
    // One day before (~1440 minutes), allow 30-minute window
    if (Math.abs(mins - 1440) <= 30) {
      const ok = await sendSms(String(a.client_phone), buildMessage("day", a))
      if (ok) sent += 1
      continue
    }
    // Three hours before (~180 minutes), allow 20-minute window
    if (Math.abs(mins - 180) <= 20) {
      const ok = await sendSms(String(a.client_phone), buildMessage("three_hours", a))
      if (ok) sent += 1
      continue
    }
    // One hour before (~60 minutes), allow 10-minute window
    if (Math.abs(mins - 60) <= 10) {
      const ok = await sendSms(String(a.client_phone), buildMessage("one_hour", a))
      if (ok) sent += 1
      continue
    }
  }
  return NextResponse.json({ ok: true, sent })
}