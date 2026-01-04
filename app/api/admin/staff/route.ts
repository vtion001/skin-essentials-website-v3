import { NextResponse } from "next/server"
import { jsonMaybeMasked } from "@/lib/admin-mask"
import { supabaseAdminClient } from "@/lib/supabase-admin"
import { aesEncryptToString, aesDecryptFromString, verifyCsrfToken } from "@/lib/utils"
import { logAudit } from "@/lib/audit-logger"
import { getAuthUser } from "@/lib/auth-server"

import { DecryptionService } from "@/lib/encryption/decrypt.service"

export async function GET(req: Request) {
  const user = await getAuthUser(req)
  const admin = supabaseAdminClient()
  if (!admin) return jsonMaybeMasked(req, { error: 'Supabase admin client not available' }, { status: 500 })

  const { data, error } = await admin.from('staff').select('*').order('created_at', { ascending: false })

  if (user) {
    await logAudit({
      userId: user.id,
      action: 'READ',
      resource: 'Staff',
      status: error ? 'FAILURE' : 'SUCCESS',
      details: error ? { error: error.message } : { count: data?.length }
    })
  }

  if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })

  // Enforce role-based access control for decryption
  const { DecryptionAccessControl } = await import("@/lib/auth/decryption-access")
  const canDecrypt = user ? await DecryptionAccessControl.canDecrypt(user, 'staff') : false

  const staff = (data || []).map((s: any) => {
    if (!canDecrypt) {
      return {
        ...s,
        first_name: s.first_name ? "[Secure Locked]" : null,
        last_name: s.last_name ? "[Secure Locked]" : null,
        email: s.email ? "[Secure Locked]" : null,
        phone: s.phone ? "[Secure Locked]" : null,
        license_number: s.license_number ? "[Secure Locked]" : null,
        decryption_error: true
      }
    }

    // Decrypt main fields
    const decrypted = DecryptionService.decryptObject(s, [
      'first_name',
      'last_name',
      'email',
      'phone',
      'license_number',
      'notes'
    ])

    // Decrypt nested treatments if they exist
    if (Array.isArray(decrypted.treatments)) {
      decrypted.treatments = decrypted.treatments.map((t: any) => {
        const decT = DecryptionService.decryptObject(t, ['clientName', 'procedure'])
        return {
          ...decT,
          decryption_error: decT.clientName === "[Unavailable]" || decT.procedure === "[Unavailable]"
        }
      })
    }

    const hasDecryptionError =
      decrypted.first_name === "[Unavailable]" ||
      decrypted.last_name === "[Unavailable]" ||
      decrypted.license_number === "[Unavailable]"

    if (hasDecryptionError && user) {
      logAudit({
        userId: user.id,
        action: 'DECRYPTION_FAILED',
        resource: 'Staff',
        resourceId: s.id,
        status: 'FAILURE',
        details: { field_failure: true }
      }).catch(() => { })
    }

    return {
      ...decrypted,
      decryption_error: hasDecryptionError
    }
  })

  return jsonMaybeMasked(req, { staff })
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const cookiesMap = new Map<string, string>()
  const cookieHeader = req.headers.get('cookie') || ''
  cookieHeader.split(';').forEach((pair) => {
    const [k, v] = pair.split('=')
    if (k) cookiesMap.set(k.trim(), decodeURIComponent((v || '').trim()))
  })
  if (!verifyCsrfToken(req.headers, cookiesMap)) {
    return jsonMaybeMasked(req, { error: 'Invalid CSRF token' }, { status: 403 })
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
  if (!admin) return jsonMaybeMasked(req, { error: 'Supabase admin client not available' }, { status: 500 })

  const { data, error } = await admin.from('staff').insert(payload).select('*').single()

  if (user) {
    await logAudit({
      userId: user.id,
      action: 'CREATE',
      resource: 'Staff',
      resourceId: id,
      status: error ? 'FAILURE' : 'SUCCESS'
    })
  }

  if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })
  const staff = {
    ...data,
    license_number: aesDecryptFromString(data.license_number) ?? data.license_number,
    notes: aesDecryptFromString(data.notes) ?? data.notes,
  }
  return jsonMaybeMasked(req, { staff })
}

export async function PATCH(req: Request) {
  const user = await getAuthUser(req)
  const cookiesMap = new Map<string, string>()
  const cookieHeader = req.headers.get('cookie') || ''
  cookieHeader.split(';').forEach((pair) => {
    const [k, v] = pair.split('=')
    if (k) cookiesMap.set(k.trim(), decodeURIComponent((v || '').trim()))
  })
  if (!verifyCsrfToken(req.headers, cookiesMap)) {
    return jsonMaybeMasked(req, { error: 'Invalid CSRF token' }, { status: 403 })
  }
  const body = await req.json()
  const { id } = body || {}
  if (!id) return jsonMaybeMasked(req, { error: 'Missing id' }, { status: 400 })
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
  if (!admin) return jsonMaybeMasked(req, { error: 'Supabase admin client not available' }, { status: 500 })

  const { data, error } = await admin.from('staff').update(updates).eq('id', id).select('*').single()

  if (user) {
    await logAudit({
      userId: user.id,
      action: 'UPDATE',
      resource: 'Staff',
      resourceId: id,
      status: error ? 'FAILURE' : 'SUCCESS'
    })
  }

  if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })
  const staff = {
    ...data,
    license_number: aesDecryptFromString(data.license_number) ?? data.license_number,
    notes: aesDecryptFromString(data.notes) ?? data.notes,
  }
  return jsonMaybeMasked(req, { staff })
}

export async function DELETE(req: Request) {
  const user = await getAuthUser(req)
  const body = await req.json()
  const { id } = body || {}
  if (!id) return jsonMaybeMasked(req, { error: 'Missing id' }, { status: 400 })
  const admin = supabaseAdminClient()
  if (!admin) return jsonMaybeMasked(req, { error: 'Supabase admin client not available' }, { status: 500 })
  const { error } = await admin.from('staff').delete().eq('id', id)

  if (user) {
    await logAudit({
      userId: user.id,
      action: 'DELETE',
      resource: 'Staff',
      resourceId: id,
      status: error ? 'FAILURE' : 'SUCCESS'
    })
  }

  if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })
  return jsonMaybeMasked(req, { success: true })
}