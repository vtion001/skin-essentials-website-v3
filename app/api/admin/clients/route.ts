import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"
import { aesEncrypt, aesDecrypt, aesEncryptToString, aesDecryptFromString, verifyCsrfToken } from "@/lib/utils"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const admin = supabaseAdminClient()
    const { data, error } = await admin
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const decryptJson = (v: any) => aesDecrypt(v) ?? v
    const clients = (data || []).map((c: any) => ({
      ...c,
      email: aesDecryptFromString(c.email) ?? c.email,
      phone: aesDecryptFromString(c.phone) ?? c.phone,
      address: aesDecryptFromString(c.address) ?? c.address,
      emergency_contact: decryptJson(c.emergency_contact),
      medical_history: Array.isArray(c.medical_history) ? c.medical_history : decryptJson(c.medical_history),
      allergies: Array.isArray(c.allergies) ? c.allergies : decryptJson(c.allergies),
      preferences: c.preferences && typeof c.preferences === 'object' ? c.preferences : decryptJson(c.preferences),
    }))
    return NextResponse.json({ clients })
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const cookiesMap = new Map<string, string>()
    cookieStore.getAll().forEach(c => cookiesMap.set(c.name, c.value))
    if (!verifyCsrfToken(req.headers, cookiesMap)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }
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
      email: aesEncryptToString(raw.email ?? null),
      phone: aesEncryptToString(raw.phone ?? null),
      date_of_birth: raw.dateOfBirth ?? raw.date_of_birth ?? null,
      gender: raw.gender ?? null,
      address: aesEncryptToString(raw.address ?? null),
      emergency_contact: aesEncrypt(toEmergencyContact(raw.emergencyContact ?? raw.emergency_contact)),
      medical_history: Array.isArray(raw.medicalHistory ?? raw.medical_history) ? aesEncrypt(raw.medicalHistory ?? raw.medical_history) : aesEncrypt([]),
      allergies: Array.isArray(raw.allergies) ? aesEncrypt(raw.allergies) : aesEncrypt([]),
      preferences: raw.preferences ? aesEncrypt(raw.preferences) : null,
      source: raw.source ?? null,
      status: raw.status ?? null,
      total_spent: raw.totalSpent ?? raw.total_spent ?? 0,
      last_visit: raw.lastVisit ?? raw.last_visit ?? null,
    }
    const admin = supabaseAdminClient()
    const { data, error } = await admin.from('clients').insert(payload).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const client = {
      ...data,
      email: aesDecryptFromString(data.email) ?? data.email,
      phone: aesDecryptFromString(data.phone) ?? data.phone,
      address: aesDecryptFromString(data.address) ?? data.address,
      emergency_contact: aesDecrypt(data.emergency_contact),
      medical_history: aesDecrypt(data.medical_history),
      allergies: aesDecrypt(data.allergies),
      preferences: aesDecrypt(data.preferences) ?? data.preferences,
    }
    return NextResponse.json({ client })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = cookies()
    const cookiesMap = new Map<string, string>()
    cookieStore.getAll().forEach(c => cookiesMap.set(c.name, c.value))
    if (!verifyCsrfToken(req.headers, cookiesMap)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }
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
      email: body.email !== undefined ? aesEncryptToString(body.email) : undefined,
      phone: body.phone !== undefined ? aesEncryptToString(body.phone) : undefined,
      date_of_birth: body.dateOfBirth ?? body.date_of_birth,
      gender: body.gender,
      address: body.address !== undefined ? aesEncryptToString(body.address) : undefined,
      emergency_contact: toEmergencyContactUpd(body.emergencyContact ?? body.emergency_contact) !== undefined ? aesEncrypt(toEmergencyContactUpd(body.emergencyContact ?? body.emergency_contact)) : undefined,
      medical_history: Array.isArray(body.medicalHistory ?? body.medical_history) ? aesEncrypt(body.medicalHistory ?? body.medical_history) : undefined,
      allergies: Array.isArray(body.allergies) ? aesEncrypt(body.allergies) : undefined,
      preferences: body.preferences !== undefined ? aesEncrypt(body.preferences) : undefined,
      source: body.source,
      status: body.status,
      total_spent: body.totalSpent ?? body.total_spent,
      last_visit: body.lastVisit ?? body.last_visit,
      updated_at: new Date().toISOString(),
    }
    const admin = supabaseAdminClient()
    const { data, error } = await admin.from('clients').update(updates).eq('id', id).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const client = {
      ...data,
      email: aesDecryptFromString(data.email) ?? data.email,
      phone: aesDecryptFromString(data.phone) ?? data.phone,
      address: aesDecryptFromString(data.address) ?? data.address,
      emergency_contact: aesDecrypt(data.emergency_contact),
      medical_history: aesDecrypt(data.medical_history),
      allergies: aesDecrypt(data.allergies),
      preferences: aesDecrypt(data.preferences) ?? data.preferences,
    }
    return NextResponse.json({ client })
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