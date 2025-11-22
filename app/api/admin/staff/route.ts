import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"
import { aesEncryptToString, aesDecryptFromString, verifyCsrfToken } from "@/lib/utils"
import { headers } from "next/headers"

export async function GET() {
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('staff').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const staff = (data || []).map((s: any) => ({
    ...s,
    license_number: aesDecryptFromString(s.license_number) ?? s.license_number,
    notes: aesDecryptFromString(s.notes) ?? s.notes,
  }))
  return NextResponse.json({ staff })
}

export async function POST(req: Request) {
  const cookiesMap = new Map<string, string>()
  const cookieHeader = req.headers.get('cookie') || ''
  cookieHeader.split(';').forEach((pair) => {
    const [k, v] = pair.split('=')
    if (k) cookiesMap.set(k.trim(), decodeURIComponent((v || '').trim()))
  })
  if (!verifyCsrfToken(req.headers, cookiesMap)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  const raw = await req.json()
  const id = raw.id || `staff_${Date.now()}`
  const payload = {
    id,
    first_name: raw.firstName ?? raw.first_name ?? null,
    last_name: raw.lastName ?? raw.last_name ?? null,
    email: raw.email ?? null,
    phone: raw.phone ?? null,
    position: raw.position ?? null,
    department: raw.department ?? null,
    license_number: aesEncryptToString(raw.licenseNumber ?? raw.license_number ?? null),
    specialties: Array.isArray(raw.specialties) ? raw.specialties : [],
    hire_date: raw.hireDate ?? raw.hire_date ?? null,
    status: raw.status ?? null,
    avatar_url: raw.avatarUrl ?? raw.avatar_url ?? null,
    notes: aesEncryptToString(raw.notes ?? null),
    treatments: Array.isArray(raw.treatments) ? raw.treatments : [],
  }
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('staff').insert(payload).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const staff = {
    ...data,
    license_number: aesDecryptFromString(data.license_number) ?? data.license_number,
    notes: aesDecryptFromString(data.notes) ?? data.notes,
  }
  return NextResponse.json({ staff })
}

export async function PATCH(req: Request) {
  const cookiesMap = new Map<string, string>()
  const cookieHeader = req.headers.get('cookie') || ''
  cookieHeader.split(';').forEach((pair) => {
    const [k, v] = pair.split('=')
    if (k) cookiesMap.set(k.trim(), decodeURIComponent((v || '').trim()))
  })
  if (!verifyCsrfToken(req.headers, cookiesMap)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  const body = await req.json()
  const { id } = body || {}
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const updates = {
    first_name: body.firstName ?? body.first_name,
    last_name: body.lastName ?? body.last_name,
    email: body.email,
    phone: body.phone,
    position: body.position,
    department: body.department,
    license_number: body.licenseNumber !== undefined ? aesEncryptToString(body.licenseNumber ?? body.license_number) : undefined,
    specialties: Array.isArray(body.specialties) ? body.specialties : undefined,
    hire_date: body.hireDate ?? body.hire_date,
    status: body.status,
    avatar_url: body.avatarUrl ?? body.avatar_url,
    notes: body.notes !== undefined ? aesEncryptToString(body.notes) : undefined,
    treatments: Array.isArray(body.treatments) ? body.treatments : undefined,
    updated_at: new Date().toISOString(),
  }
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('staff').update(updates).eq('id', id).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const staff = {
    ...data,
    license_number: aesDecryptFromString(data.license_number) ?? data.license_number,
    notes: aesDecryptFromString(data.notes) ?? data.notes,
  }
  return NextResponse.json({ staff })
}

export async function DELETE(req: Request) {
  const body = await req.json()
  const { id } = body || {}
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const admin = supabaseAdminClient()
  const { error } = await admin.from('staff').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}