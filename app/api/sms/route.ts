import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"

function normPhone(p: string) {
  // Semaphore/iProgSMS expects numbers like 09xxxxxxxxx or 639xxxxxxxxx.
  // Best to keep standard +63 format or just 09 locally.
  const digits = p.replace(/[^0-9]/g, "")
  if (digits.startsWith("63")) return digits
  if (digits.startsWith("0")) return "63" + digits.slice(1)
  return digits
}

export async function GET() {
  const iprogToken = process.env.IPROGSMS_API_TOKEN
  if (iprogToken) {
    const { getSmsCredits } = await import("@/lib/iprogsms")
    const creds = await getSmsCredits()
    return NextResponse.json({
      configured: true,
      provider: "iProgSMS",
      sender: "Default",
      status: "Active",
      balance: creds.ok ? String(creds.balance) : "Error"
    })
  }

  const accountBase = "https://api.semaphore.co/api/v4"
  const sender = process.env.SEMAPHORE_SENDER_NAME || "SEMAPHORE"
  const keySet = Boolean(process.env.SEMAPHORE_API_KEY)

  // Optional: Fetch account balance/status if key is set
  let status = "Not Configured"
  let balance = "0"

  if (keySet) {
    try {
      const res = await fetch(`${accountBase}/account?apikey=${process.env.SEMAPHORE_API_KEY}`)
      const data = await res.json()
      if (data.status) {
        status = data.status
        balance = data.credit_balance
      } else {
        status = "Invalid Key"
      }
    } catch (e) {
      status = "Error"
    }
  }

  return NextResponse.json({
    configured: keySet && status !== "Invalid Key",
    provider: "Semaphore",
    sender,
    status,
    balance
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    let { to, message, sender } = body || {}

    if (!to || !message) {
      return NextResponse.json({ error: "Missing 'to' or 'message'" }, { status: 400 })
    }

    const { sendSms } = await import("@/lib/sms-service")
    const result = await sendSms(to, message, sender)

    if (!result.ok) {
      return NextResponse.json({ error: result.error, details: result.details }, { status: 502 })
    }

    return NextResponse.json({ ok: true, data: result.data })
  } catch (e: unknown) {
    console.error("SMS API Error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}