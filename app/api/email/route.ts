import { GmailMessage } from "@/lib/types/api.types"
import { NextRequest, NextResponse } from "next/server"

async function getAccessToken() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshToken) return null
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    })
  })
  const json = await res.json()
  return json?.access_token || null
}

function toBase64Url(input: string) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function sendGmailMessage(to: string, subject: string, html: string) {
  const accessToken = await getAccessToken()
  const from = process.env.GOOGLE_SENDER_EMAIL || to
  if (!accessToken || !from) return { ok: false }
  const raw =
    `From: ${from}\r\n` +
    `To: ${to}\r\n` +
    `Subject: ${subject}\r\n` +
    `MIME-Version: 1.0\r\n` +
    `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
    html
  const body = { raw: toBase64Url(raw) }
  const resp = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  return { ok: resp.ok }
}

async function listRecentMessages() {
  const accessToken = await getAccessToken()
  if (!accessToken) return []
  const list = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?q=in:inbox newer_than:1d", {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  const json = await list.json()
  const ids = Array.isArray(json?.messages) ? json.messages.map((m: { id: string }) => m.id) : []
  const out: { id: string; from: string; to: string; subject: string; snippet: string }[] = []
  for (const id of ids.slice(0, 10)) {
    const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    const j = await r.json()
    const headers = Array.isArray(j?.payload?.headers) ? j.payload.headers : []
    const from = headers.find((h: { name: string; value: string }) => h.name === "From")?.value || ""
    const to = headers.find((h: { name: string; value: string }) => h.name === "To")?.value || ""
    const subject = headers.find((h: { name: string; value: string }) => h.name === "Subject")?.value || ""
    out.push({ id, from, to, subject, snippet: j?.snippet || "" })
  }
  return out
}

async function aiComposeReply(snippet: string) {
  const key = process.env.OPENAI_API_KEY
  const base = "https://api.openai.com/v1/chat/completions"
  if (!key) return `Thank you for your message. Our team will get back to you shortly.`
  const res = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful clinic assistant. Write concise, warm, professional replies." },
        { role: "user", content: `Client message: ${snippet}. Compose a helpful reply and ask clarifying questions if needed.` }
      ],
      temperature: 0.7
    })
  })
  const json = await res.json()
  const content = json?.choices?.[0]?.message?.content || ""
  return content || `Thank you for reaching out. We will follow up shortly.`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const action = body?.action
    if (action === "send") {
      const p = body?.payload || {}
      const to = String(p.to || "")
      const subject = String(p.subject || "Message")
      const html = String(p.html || "")
      if (!to || !html) return NextResponse.json({ ok: false, error: "missing_to_or_body" }, { status: 400 })
      const r = await sendGmailMessage(to, subject, html)
      return NextResponse.json({ ok: r.ok })
    }
    if (action === "process") {
      const messages = await listRecentMessages()
      const sender = process.env.GOOGLE_SENDER_EMAIL || ""
      const results: { id: string; to: string }[] = []
      for (const m of messages) {
        if (!m.from || !m.snippet) continue
        const match = m.from.match(/<([^>]+)>/) || []
        const recipient = match[1] || m.from
        const reply = await aiComposeReply(m.snippet)
        await sendGmailMessage(recipient, "Re: your message", `<div style="font-family:system-ui">${reply}</div>`)
        results.push({ id: m.id, to: recipient })
      }
      return NextResponse.json({ ok: true, processed: results.length })
    }
    if (action === "list") {
      const messages = await listRecentMessages()
      return NextResponse.json({ ok: true, messages })
    }
    return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}