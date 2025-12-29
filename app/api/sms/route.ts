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
    return NextResponse.json({
      configured: true,
      provider: "iProgSMS",
      sender: "Default",
      status: "Active",
      balance: "Unlimited" // iProgSMS doesn't seemingly expose a balance endpoint
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
    console.log("[SMS] Incoming request:", body)

    let { to, message, sender } = body || {}

    if (!to || !message) {
      console.log("[SMS] Missing 'to' or 'message'")
      return NextResponse.json({ error: "Missing 'to' or 'message'" }, { status: 400 })
    }

    const number = normPhone(String(to))
    if (!number) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
    }

    // Check for iProgSMS first
    const iprogToken = process.env.IPROGSMS_API_TOKEN
    if (iprogToken) {
      console.log(`[SMS] Sending via iProgSMS to: ${number}`)

      const res = await fetch("https://www.iprogsms.com/api/v1/sms_messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          api_token: iprogToken,
          phone_number: number,
          message: String(message)
        })
      })

      const data = await res.json().catch(() => null)
      console.log("[SMS] iProgSMS Response:", res.status, data)

      if (!res.ok) {
        return NextResponse.json({ error: "Failed to send via iProgSMS", details: data }, { status: 502 })
      }


      const logEntry = {
        context: 'sms_log',
        message: `Sent to ${number} via iProgSMS`,
        meta: { provider: 'iProgSMS', to, message, status: 'sent', timestamp: new Date().toISOString() }
      }
      const admin = supabaseAdminClient()
      if (admin) {
        const { error: logErr } = await admin.from('error_logs').insert(logEntry)
        if (logErr) console.error("Failed to log SMS:", logErr)
      }

      return NextResponse.json({ ok: true, data })
    }

    // Fallback to Semaphore
    const apiKey = process.env.SEMAPHORE_API_KEY
    if (!apiKey) {
      console.log("[SMS] API key missing")
      return NextResponse.json({ error: "SMS Provider not configured (No iProgSMS or Semaphore key)" }, { status: 500 })
    }

    const senderName = sender || process.env.SEMAPHORE_SENDER_NAME || "SEMAPHORE"

    console.log(`[SMS] Sending via Semaphore to: ${number}, Sender: ${senderName}`)

    // Semaphore API endpoint
    const url = "https://api.semaphore.co/api/v4/messages"

    const params = new URLSearchParams()
    params.append("apikey", apiKey)
    params.append("number", number)
    params.append("message", String(message))
    params.append("sendername", senderName)

    const res = await fetch(url, {
      method: "POST",
      body: params,
    })

    const data = await res.json().catch((err) => {
      console.error("[SMS] Failed to parse response JSON", err)
      return null
    })

    console.log("[SMS] Semaphore Response:", res.status, JSON.stringify(data))

    if (!res.ok || (Array.isArray(data) && data.length === 0)) {
      console.error("[SMS] Semaphore API Error")
      return NextResponse.json({ error: "Failed to send message via Semaphore", details: data }, { status: 502 })
    }

    const logEntry = {
      context: 'sms_log',
      message: `Sent to ${number} via Semaphore`,
      meta: { provider: 'Semaphore', to, message, status: 'sent', timestamp: new Date().toISOString() }
    }
    const admin = supabaseAdminClient()
    if (admin) {
      const { error: logErr } = await admin.from('error_logs').insert(logEntry)
      if (logErr) console.error("Failed to log SMS:", logErr)
    }

    return NextResponse.json({ ok: true, data })

  } catch (e: any) {
    console.error("SMS Send Error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}