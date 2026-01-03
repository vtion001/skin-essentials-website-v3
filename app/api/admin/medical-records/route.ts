import { NextResponse } from "next/server"
import { jsonMaybeMasked } from "@/lib/admin-mask"
import { supabaseAdminClient } from "@/lib/supabase-admin"
import { aesEncrypt, aesDecrypt, aesEncryptToString, aesDecryptFromString, verifyCsrfToken } from "@/lib/utils"
import { headers } from "next/headers"

export async function GET(req: Request) {
  const admin = supabaseAdminClient()
  if (!admin) return jsonMaybeMasked(req, { error: 'Supabase admin client not available' }, { status: 500 })
  const { data, error } = await admin.from('medical_records').select('*').order('created_at', { ascending: false })
  if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })
  const records = (data || []).map((r: { id: string; [key: string]: unknown }) => {
    const decrypt = (val: unknown) => aesDecrypt(val) ?? val
    return {
      ...r,
      medical_history: decrypt(r.medical_history),
      allergies: decrypt(r.allergies),
      current_medications: decrypt(r.current_medications),
      treatment_plan: aesDecryptFromString(r.treatment_plan) ?? r.treatment_plan,
      notes: aesDecryptFromString(r.notes) ?? r.notes,
      attachments: decrypt(r.attachments),
    }
  })
  return jsonMaybeMasked(req, { records })
}

export async function POST(req: Request) {
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
  const id = raw.id || `med_${Date.now()}`
  const payload = {
    id,
    client_id: raw.clientId ?? raw.client_id ?? null,
    appointment_id: raw.appointmentId ?? raw.appointment_id ?? null,
    date: raw.date ?? null,
    chief_complaint: raw.chiefComplaint ?? raw.chief_complaint ?? null,
    medical_history: aesEncrypt(Array.isArray(raw.medicalHistory ?? raw.medical_history) ? (raw.medicalHistory ?? raw.medical_history) : []),
    allergies: aesEncrypt(Array.isArray(raw.allergies) ? raw.allergies : []),
    current_medications: aesEncrypt(Array.isArray(raw.currentMedications ?? raw.current_medications) ? (raw.currentMedications ?? raw.current_medications) : []),
    treatment_plan: aesEncryptToString(raw.treatmentPlan ?? raw.treatment_plan ?? null),
    notes: aesEncryptToString(raw.notes ?? null),
    attachments: aesEncrypt(Array.isArray(raw.attachments) ? raw.attachments : []),
    created_by: raw.createdBy ?? raw.created_by ?? null,
    treatments: Array.isArray(raw.treatments) ? raw.treatments : [],
  }
  const admin = supabaseAdminClient()
  if (!admin) return jsonMaybeMasked(req, { error: 'Supabase admin client not available' }, { status: 500 })
  const { data, error } = await admin.from('medical_records').insert(payload).select('*').single()
  if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })
  const record = {
    ...data,
    medical_history: aesDecrypt(data.medical_history),
    allergies: aesDecrypt(data.allergies),
    current_medications: aesDecrypt(data.current_medications),
    treatment_plan: aesDecryptFromString(data.treatment_plan) ?? data.treatment_plan,
    notes: aesDecryptFromString(data.notes) ?? data.notes,
    attachments: aesDecrypt(data.attachments),
  }
  return jsonMaybeMasked(req, { record })
}

export async function PATCH(req: Request) {
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
    client_id: body.clientId ?? body.client_id,
    appointment_id: body.appointmentId ?? body.appointment_id,
    date: body.date,
    chief_complaint: body.chiefComplaint ?? body.chief_complaint,
    medical_history: Array.isArray(body.medicalHistory ?? body.medical_history) ? aesEncrypt(body.medicalHistory ?? body.medical_history) : undefined,
    allergies: Array.isArray(body.allergies) ? aesEncrypt(body.allergies) : undefined,
    current_medications: Array.isArray(body.currentMedications ?? body.current_medications) ? aesEncrypt(body.currentMedications ?? body.current_medications) : undefined,
    treatment_plan: body.treatmentPlan ? aesEncryptToString(body.treatment_plan ?? body.treatmentPlan) : undefined,
    notes: body.notes ? aesEncryptToString(body.notes) : undefined,
    attachments: Array.isArray(body.attachments) ? aesEncrypt(body.attachments) : undefined,
    created_by: body.createdBy ?? body.created_by,
    treatments: Array.isArray(body.treatments) ? body.treatments : undefined,
    updated_at: new Date().toISOString(),
  }
  const admin = supabaseAdminClient()
  if (!admin) return jsonMaybeMasked(req, { error: 'Supabase admin client not available' }, { status: 500 })
  const { data, error } = await admin.from('medical_records').update(updates).eq('id', id).select('*').single()
  if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })
  const record = {
    ...data,
    medical_history: aesDecrypt(data.medical_history),
    allergies: aesDecrypt(data.allergies),
    current_medications: aesDecrypt(data.current_medications),
    treatment_plan: aesDecryptFromString(data.treatment_plan) ?? data.treatment_plan,
    notes: aesDecryptFromString(data.notes) ?? data.notes,
    attachments: aesDecrypt(data.attachments),
  }
  return jsonMaybeMasked(req, { record })
}

export async function DELETE(req: Request) {
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
  const admin = supabaseAdminClient()
  if (!admin) return jsonMaybeMasked(req, { error: 'Supabase admin client not available' }, { status: 500 })
  const { error } = await admin.from('medical_records').delete().eq('id', id)
  if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })
  return jsonMaybeMasked(req, { success: true })
}