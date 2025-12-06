import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyCsrfToken } from "@/lib/utils"

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const cookiesMap = new Map<string, string>()
  cookieStore.getAll().forEach(c => cookiesMap.set(c.name, c.value))
  if (!verifyCsrfToken(request.headers, cookiesMap)) {
    return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 })
  }
  const { code } = await request.json().catch(() => ({}))
  const expected = process.env.ADMIN_MFA_CODE || ''
  if (!expected) {
    return NextResponse.json({ success: false, error: 'MFA not configured' }, { status: 500 })
  }
  if (String(code || '').trim() !== expected.trim()) {
    return NextResponse.json({ success: false, error: 'Invalid MFA code' }, { status: 401 })
  }
  const res = NextResponse.json({ success: true })
  res.cookies.set('mfa_ok', '1', { httpOnly: true, sameSite: 'strict', path: '/' })
  return res
}