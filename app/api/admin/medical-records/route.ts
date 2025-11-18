import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"

export async function GET() {
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('medical_records').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ records: data || [] })
}

export async function POST(req: Request) {
  const raw = await req.json()
  const id = raw.id || `med_${Date.now()}`
  const payload = {
    id,
    client_id: raw.clientId ?? raw.client_id ?? null,
    appointment_id: raw.appointmentId ?? raw.appointment_id ?? null,
    date: raw.date ?? null,
    chief_complaint: raw.chiefComplaint ?? raw.chief_complaint ?? null,
    medical_history: Array.isArray(raw.medicalHistory ?? raw.medical_history) ? (raw.medicalHistory ?? raw.medical_history) : [],
    allergies: Array.isArray(raw.allergies) ? raw.allergies : [],
    current_medications: Array.isArray(raw.currentMedications ?? raw.current_medications) ? (raw.currentMedications ?? raw.current_medications) : [],
    treatment_plan: raw.treatmentPlan ?? raw.treatment_plan ?? null,
    notes: raw.notes ?? null,
    attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
    created_by: raw.createdBy ?? raw.created_by ?? null,
  }
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('medical_records').insert(payload).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: data })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { id } = body || {}
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const updates = {
    client_id: body.clientId ?? body.client_id,
    appointment_id: body.appointmentId ?? body.appointment_id,
    date: body.date,
    chief_complaint: body.chiefComplaint ?? body.chief_complaint,
    medical_history: Array.isArray(body.medicalHistory ?? body.medical_history) ? (body.medicalHistory ?? body.medical_history) : undefined,
    allergies: Array.isArray(body.allergies) ? body.allergies : undefined,
    current_medications: Array.isArray(body.currentMedications ?? body.current_medications) ? (body.currentMedications ?? body.current_medications) : undefined,
    treatment_plan: body.treatmentPlan ?? body.treatment_plan,
    notes: body.notes,
    attachments: Array.isArray(body.attachments) ? body.attachments : undefined,
    created_by: body.createdBy ?? body.created_by,
    updated_at: new Date().toISOString(),
  }
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('medical_records').update(updates).eq('id', id).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: data })
}

export async function DELETE(req: Request) {
  const body = await req.json()
  const { id } = body || {}
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const admin = supabaseAdminClient()
  const { error } = await admin.from('medical_records').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}