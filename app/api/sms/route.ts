import { NextResponse } from "next/server"

function normPhone(p: string) {
  const digits = p.replace(/[^0-9+]/g, "")
  if (digits.startsWith("0")) return "+63" + digits.slice(1)
  if (!digits.startsWith("+")) return "+" + digits
  return digits
}

export async function GET() {
  const base = process.env.IPROG_SMS_BASE_URL || process.env.IPROG_SMS_SEND_URL || ""
  const sender = process.env.IPROG_SMS_SENDER || "iprogtech"
  const fallback = process.env.IPROG_SMS_FALLBACK === "true"
  const keySet = Boolean(process.env.IPROG_SMS_API_KEY)
  return NextResponse.json({ configured: Boolean(base) && keySet, base, sender, fallback })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    let { to, message, sender } = body || {}
    if (!to || !message) return NextResponse.json({ error: "Missing 'to' or 'message'" }, { status: 400 })
    sender = sender || process.env.IPROG_SMS_SENDER || "iprogtech"
    const apiKey = process.env.IPROG_SMS_API_KEY || ""
    const sendUrl = process.env.IPROG_SMS_SEND_URL || (process.env.IPROG_SMS_BASE_URL ? `${process.env.IPROG_SMS_BASE_URL.replace(/\/$/, '')}/api/v1/send` : "")
    if (!apiKey || !sendUrl) return NextResponse.json({ error: "SMS provider not configured" }, { status: 500 })

    const payload = { sender, to: normPhone(String(to)), message: String(message) }

    // Try JSON POST with Bearer token, fallback to query params if provider requires
    let res = await fetch(sendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const url = new URL(sendUrl)
      url.searchParams.set("sender", payload.sender)
      url.searchParams.set("to", payload.to)
      url.searchParams.set("message", payload.message)
      url.searchParams.set("api_key", apiKey)
      res = await fetch(url.toString(), { method: "POST" })
    }

    const data = await res.json().catch(() => ({ ok: res.ok }))
    if (!res.ok) return NextResponse.json({ error: data?.error || "Failed to send" }, { status: 502 })
    return NextResponse.json({ ok: true, provider: data })
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}