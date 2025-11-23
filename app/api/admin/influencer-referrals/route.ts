import { NextResponse } from "next/server"
import { jsonMaybeMasked } from "@/lib/admin-mask"
import { supabaseAdminClient } from "@/lib/supabase-admin"

export async function GET(req: Request) {
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('influencer_referrals').select('*').order('created_at', { ascending: false })
  if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })
  return jsonMaybeMasked(req, { referrals: data || [] })
}

export async function POST(req: Request) {
  const raw = await req.json()
  const id = raw.id || `ref_${Date.now()}`
  const payload = {
    id,
    influencer_id: raw.influencerId ?? raw.influencer_id ?? null,
    client_id: raw.clientId ?? raw.client_id ?? null,
    client_name: raw.clientName ?? raw.client_name ?? null,
    amount: raw.amount ?? null,
    date: raw.date ?? null,
    appointment_id: raw.appointmentId ?? raw.appointment_id ?? null,
    notes: raw.notes ?? null,
  }
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('influencer_referrals').insert(payload).select('*').single()
  if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })
  return jsonMaybeMasked(req, { referral: data })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { id } = body || {}
  if (!id) return jsonMaybeMasked(req, { error: 'Missing id' }, { status: 400 })
  const updates = {
    influencer_id: body.influencerId ?? body.influencer_id,
    client_id: body.clientId ?? body.client_id,
    client_name: body.clientName ?? body.client_name,
    amount: body.amount,
    date: body.date,
    appointment_id: body.appointmentId ?? body.appointment_id,
    notes: body.notes,
  }
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('influencer_referrals').update(updates).eq('id', id).select('*').single()
  if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })
  return jsonMaybeMasked(req, { referral: data })
}

export async function DELETE(req: Request) {
  const body = await req.json()
  const { id } = body || {}
  if (!id) return jsonMaybeMasked(req, { error: 'Missing id' }, { status: 400 })
  const admin = supabaseAdminClient()
  const { error } = await admin.from('influencer_referrals').delete().eq('id', id)
  if (error) return jsonMaybeMasked(req, { error: error.message }, { status: 500 })
  return jsonMaybeMasked(req, { success: true })
}