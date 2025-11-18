import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const admin = supabaseAdminClient()
    const { data, error } = await admin
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ clients: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const raw = await req.json()
    const id = raw.id || `client_${Date.now()}`
    const toEmergencyContact = (val: any) => {
      if (!val) return null
      if (typeof val === 'string') return { contact: val }
      return val
    }
    const payload = {
      id,
      first_name: raw.firstName ?? raw.first_name ?? null,
      last_name: raw.lastName ?? raw.last_name ?? null,
      email: raw.email ?? null,
      phone: raw.phone ?? null,
      date_of_birth: raw.dateOfBirth ?? raw.date_of_birth ?? null,
      gender: raw.gender ?? null,
      address: raw.address ?? null,
      emergency_contact: toEmergencyContact(raw.emergencyContact ?? raw.emergency_contact),
      medical_history: Array.isArray(raw.medicalHistory ?? raw.medical_history) ? (raw.medicalHistory ?? raw.medical_history) : [],
      allergies: Array.isArray(raw.allergies) ? raw.allergies : [],
      preferences: raw.preferences ?? null,
      source: raw.source ?? null,
      status: raw.status ?? null,
      total_spent: raw.totalSpent ?? raw.total_spent ?? 0,
      last_visit: raw.lastVisit ?? raw.last_visit ?? null,
    }
    const admin = supabaseAdminClient()
    const { data, error } = await admin.from('clients').insert(payload).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ client: data })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id } = body || {}
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const toEmergencyContactUpd = (val: any) => {
      if (val === undefined) return undefined
      if (!val) return null
      if (typeof val === 'string') return { contact: val }
      return val
    }
    const updates = {
      first_name: body.firstName ?? body.first_name,
      last_name: body.lastName ?? body.last_name,
      email: body.email,
      phone: body.phone,
      date_of_birth: body.dateOfBirth ?? body.date_of_birth,
      gender: body.gender,
      address: body.address,
      emergency_contact: toEmergencyContactUpd(body.emergencyContact ?? body.emergency_contact),
      medical_history: Array.isArray(body.medicalHistory ?? body.medical_history) ? (body.medicalHistory ?? body.medical_history) : undefined,
      allergies: Array.isArray(body.allergies) ? body.allergies : undefined,
      preferences: body.preferences,
      source: body.source,
      status: body.status,
      total_spent: body.totalSpent ?? body.total_spent,
      last_visit: body.lastVisit ?? body.last_visit,
      updated_at: new Date().toISOString(),
    }
    const admin = supabaseAdminClient()
    const { data, error } = await admin.from('clients').update(updates).eq('id', id).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ client: data })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body || {}
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const admin = supabaseAdminClient()
    const { error } = await admin.from('clients').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}