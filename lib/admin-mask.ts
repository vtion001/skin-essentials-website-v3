import { NextResponse, NextRequest } from "next/server"

function maskEmail(v: any): any {
  const s = String(v || "")
  const at = s.indexOf("@")
  if (at < 0) return s
  const local = s.slice(0, at)
  const domain = s.slice(at)
  const keep = Math.min(3, local.length)
  return `${local.slice(0, keep)}***${domain}`
}

function maskPhone(v: any): any {
  const s = String(v || "")
  const digits = s.replace(/\D+/g, "")
  if (digits.length <= 5) return digits
  const first3 = digits.slice(0, 3)
  const last2 = digits.slice(-2)
  return `${first3}***${last2}`
}

function maskName(v: any): any {
  const s = String(v || "").trim()
  if (!s) return s
  const parts = s.split(/\s+/)
  const first = parts[0] || ""
  const last = parts.length > 1 ? parts[parts.length - 1] : ""
  const init = first ? `${first[0]}.` : ""
  return last ? `${init} ${last}`.trim() : init
}

const HIDE_KEYS = new Set(["client_id", "referral_code", "influencer_id"])

function maskNode(node: any): any {
  if (Array.isArray(node)) return node.map(maskNode)
  if (node && typeof node === "object") {
    const out: any = {}
    for (const [k, v] of Object.entries(node)) {
      if (HIDE_KEYS.has(k)) continue
      if (k === "client_email") out[k] = maskEmail(v)
      else if (k === "client_phone") out[k] = maskPhone(v)
      else if (k === "client_name") out[k] = maskName(v)
      else out[k] = maskNode(v)
    }
    return out
  }
  return node
}

export function jsonMasked(payload: any, init?: number | { status?: number }): Response {
  const masked = maskNode(payload)
  const body = masked && typeof masked === "object" ? { ...masked, masked: true } : { data: masked, masked: true }
  const status = typeof init === "number" ? init : init?.status
  return NextResponse.json(body, status ? { status } : {})
}

export function jsonMaybeMasked(req: NextRequest | Request | undefined, payload: any, init?: number | { status?: number }): Response {
  // HIPAA: Reveal only if requested via a secure header AND authenticated (middleware handles auth)
  const hdrGet = (req as any)?.headers?.get ? (k: string) => (req as any).headers.get(k) : () => null
  const reveal = hdrGet('x-reveal') === '1' || hdrGet('X-Reveal') === '1'

  if (reveal) {
    const status = typeof init === "number" ? init : init?.status
    const body = payload && typeof payload === 'object' ? { ...payload, masked: false } : { data: payload, masked: false }
    return NextResponse.json(body, status ? { status } : {})
  }
  return jsonMasked(payload, init as any)
}