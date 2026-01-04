import { NextResponse } from "next/server"
import { jsonMaybeMasked } from "@/lib/admin-mask"
import { supabaseAdminClient } from "@/lib/supabase-admin"
import { aesEncrypt, aesDecrypt, aesEncryptToString, aesDecryptFromString, verifyCsrfToken } from "@/lib/utils"
import { cookies } from "next/headers"
import { logAudit } from "@/lib/audit-logger"
import { getAuthUser } from "@/lib/auth-server"

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  try {
    const admin = supabaseAdminClient()
    if (!admin) return NextResponse.json({ error: 'DB Client unavailable' }, { status: 500 })

    const { data, error } = await admin
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (user) {
      await logAudit({
        userId: user.id,
        action: 'READ',
        resource: 'Clients',
        status: error ? 'FAILURE' : 'SUCCESS',
        details: error ? { error: error.message } : { count: data?.length }
      })
    }

    if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })
    const decryptJson = (v: any) => aesDecrypt(v) ?? v
    const clients = (data || []).map((c: { id: string;[key: string]: any }) => ({
      ...c,
      email: aesDecryptFromString(c.email) ?? c.email,
      phone: aesDecryptFromString(c.phone) ?? c.phone,
      address: aesDecryptFromString(c.address) ?? c.address,
      emergency_contact: decryptJson(c.emergency_contact),
      medical_history: Array.isArray(c.medical_history) ? c.medical_history : decryptJson(c.medical_history),
      allergies: Array.isArray(c.allergies) ? c.allergies : decryptJson(c.allergies),
      preferences: c.preferences && typeof c.preferences === 'object' ? c.preferences : decryptJson(c.preferences),
    }))
    return jsonMaybeMasked(req, { clients })
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  try {
    const cookieStore = await cookies()
    const cookiesMap = new Map<string, string>()
    cookieStore.getAll().forEach((c: { name: string; value: string }) => cookiesMap.set(c.name, c.value))
    if (!verifyCsrfToken(req.headers, cookiesMap)) {
      return jsonMaybeMasked(req, { error: 'Invalid CSRF token' }, { status: 403 })
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
    if (!admin) return NextResponse.json({ error: 'DB Client unavailable' }, { status: 500 })

    const norm = (v: any) => String(v || '').trim().toLowerCase()
    const emailNorm = norm(raw.email)
    const phoneNorm = norm(raw.phone)
    const nameKey = `${norm(raw.firstName ?? raw.first_name)} ${norm(raw.lastName ?? raw.last_name)}`.trim()
    const { data: existing } = await admin.from('clients').select('id, first_name, last_name, email, phone').limit(10000)
    if (Array.isArray(existing)) {
      for (const c of existing) {
        const cEmail = norm(aesDecryptFromString(c.email) ?? '')
        const cPhone = norm(aesDecryptFromString(c.phone) ?? '')
        const cNameKey = `${norm(c.first_name)} ${norm(c.last_name)}`.trim()
        const dup = (emailNorm && cEmail && emailNorm === cEmail) || (phoneNorm && cPhone && phoneNorm === cPhone) || (!emailNorm && !phoneNorm && nameKey && cNameKey && nameKey === cNameKey)
        if (dup) {
          return jsonMaybeMasked(req, { error: 'Duplicate client' }, { status: 409 })
        }
      }
    }
    const { data, error } = await admin.from('clients').insert(payload).select('*').single()

    if (user) {
      await logAudit({
        userId: user.id,
        action: 'CREATE',
        resource: 'Clients',
        resourceId: id,
        status: error ? 'FAILURE' : 'SUCCESS'
      })
    }

    if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })
    const client = {
      ...data,
      email: aesDecryptFromString(data.email) ?? data.email,
      phone: aesDecryptFromString(data.phone) ?? data.phone,
      address: aesDecryptFromString(data.address) ?? data.address,
      emergency_contact: aesDecrypt(data.emergency_contact as any),
      medical_history: aesDecrypt(data.medical_history as any),
      allergies: aesDecrypt(data.allergies as any),
      preferences: aesDecrypt(data.preferences as any) ?? data.preferences,
    }
    return jsonMaybeMasked(req, { client })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  const user = await getAuthUser(req)
  try {
    const cookieStore = await cookies()
    const cookiesMap = new Map<string, string>()
    cookieStore.getAll().forEach((c: { name: string; value: string }) => cookiesMap.set(c.name, c.value))
    if (!verifyCsrfToken(req.headers, cookiesMap)) {
      return jsonMaybeMasked(req, { error: 'Invalid CSRF token' }, { status: 403 })
    }
    const body = await req.json()
    const { id } = body || {}
    if (!id) return jsonMaybeMasked(req, { error: 'Missing id' }, { status: 400 })
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
    if (!admin) return NextResponse.json({ error: 'DB Client unavailable' }, { status: 500 })

    const norm = (v: any) => String(v || '').trim().toLowerCase()
    const emailNorm = body.email !== undefined ? norm(body.email) : undefined
    const phoneNorm = body.phone !== undefined ? norm(body.phone) : undefined
    const nameKey = `${norm(body.firstName ?? body.first_name)} ${norm(body.lastName ?? body.last_name)}`.trim()
    if (emailNorm !== undefined || phoneNorm !== undefined) {
      const { data: existing } = await admin.from('clients').select('id, first_name, last_name, email, phone').limit(10000)
      if (Array.isArray(existing)) {
        for (const c of existing) {
          if (c.id === id) continue
          const cEmail = norm(aesDecryptFromString(c.email) ?? '')
          const cPhone = norm(aesDecryptFromString(c.phone) ?? '')
          const cNameKey = `${norm(c.first_name)} ${norm(c.last_name)}`.trim()
          const dup = (emailNorm && cEmail && emailNorm === cEmail) || (phoneNorm && cPhone && phoneNorm === cPhone) || (!emailNorm && !phoneNorm && nameKey && cNameKey && nameKey === cNameKey)
          if (dup) {
            return jsonMaybeMasked(req, { error: 'Duplicate client' }, { status: 409 })
          }
        }
      }
    }
    const { data, error } = await admin.from('clients').update(updates).eq('id', id).select('*').single()

    if (user) {
      await logAudit({
        userId: user.id,
        action: 'UPDATE',
        resource: 'Clients',
        resourceId: id,
        status: error ? 'FAILURE' : 'SUCCESS'
      })
    }

    if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })
    const client = {
      ...data,
      email: aesDecryptFromString(data.email) ?? data.email,
      phone: aesDecryptFromString(data.phone) ?? data.phone,
      address: aesDecryptFromString(data.address) ?? data.address,
      emergency_contact: aesDecrypt(data.emergency_contact as any),
      medical_history: aesDecrypt(data.medical_history as any),
      allergies: aesDecrypt(data.allergies as any),
      preferences: aesDecrypt(data.preferences as any) ?? data.preferences,
    }
    return jsonMaybeMasked(req, { client })
  } catch (e) {
    return jsonMaybeMasked(req, { error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthUser(req)
  try {
    const body = await req.json()
    const { id } = body || {}
    if (!id) return jsonMaybeMasked(req, { error: 'Missing id' }, { status: 400 })
    const admin = supabaseAdminClient()
    if (!admin) return NextResponse.json({ error: 'DB Client unavailable' }, { status: 500 })
    const { error } = await admin.from('clients').delete().eq('id', id)

    if (user) {
      await logAudit({
        userId: user.id,
        action: 'DELETE',
        resource: 'Clients',
        resourceId: id,
        status: error ? 'FAILURE' : 'SUCCESS'
      })
    }

    if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })
    return jsonMaybeMasked(req, { success: true })
  } catch (e) {
    return jsonMaybeMasked(req, { error: 'Invalid request' }, { status: 400 })
  }
}