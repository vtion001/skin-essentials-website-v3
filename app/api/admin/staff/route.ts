import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"

export async function GET() {
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('staff').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ staff: data || [] })
}

export async function POST(req: Request) {
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
    license_number: raw.licenseNumber ?? raw.license_number ?? null,
    specialties: Array.isArray(raw.specialties) ? raw.specialties : [],
    hire_date: raw.hireDate ?? raw.hire_date ?? null,
    status: raw.status ?? null,
    avatar_url: raw.avatarUrl ?? raw.avatar_url ?? null,
    notes: raw.notes ?? null,
  }
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('staff').insert(payload).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ staff: data })
}

export async function PATCH(req: Request) {
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
    license_number: body.licenseNumber ?? body.license_number,
    specialties: Array.isArray(body.specialties) ? body.specialties : undefined,
    hire_date: body.hireDate ?? body.hire_date,
    status: body.status,
    avatar_url: body.avatarUrl ?? body.avatar_url,
    notes: body.notes,
    updated_at: new Date().toISOString(),
  }
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('staff').update(updates).eq('id', id).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ staff: data })
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