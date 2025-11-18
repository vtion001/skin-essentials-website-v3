import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"

export async function GET() {
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('payments').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ payments: data || [] })
}

export async function POST(req: Request) {
  const raw = await req.json()
  const admin = supabaseAdminClient()
  const payload = {
    id: raw.id || `pay_${Date.now()}`,
    appointment_id: raw.appointmentId ?? null,
    client_id: raw.clientId,
    amount: raw.amount,
    method: raw.method,
    status: raw.status,
    transaction_id: raw.transactionId ?? null,
    receipt_url: raw.receiptUrl ?? null,
    uploaded_files: Array.isArray(raw.uploadedFiles) ? raw.uploadedFiles : [],
    notes: raw.notes ?? null,
  }
  const { data, error } = await admin.from('payments').insert(payload).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ payment: data })
}

export async function PATCH(req: Request) {
  const raw = await req.json()
  const { id } = raw || {}
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const admin = supabaseAdminClient()
  const updates = {
    appointment_id: raw.appointmentId ?? undefined,
    client_id: raw.clientId ?? undefined,
    amount: raw.amount ?? undefined,
    method: raw.method ?? undefined,
    status: raw.status ?? undefined,
    transaction_id: raw.transactionId ?? undefined,
    receipt_url: raw.receiptUrl ?? undefined,
    uploaded_files: Array.isArray(raw.uploadedFiles) ? raw.uploadedFiles : undefined,
    notes: raw.notes ?? undefined,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await admin.from('payments').update(updates).eq('id', id).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ payment: data })
}

export async function DELETE(req: Request) {
  const body = await req.json()
  const { id } = body || {}
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const admin = supabaseAdminClient()
  const { error } = await admin.from('payments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}