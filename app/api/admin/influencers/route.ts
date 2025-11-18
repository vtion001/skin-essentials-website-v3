import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"

export async function GET() {
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('influencers').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ influencers: data || [] })
}

export async function POST(req: Request) {
  const raw = await req.json()
  const id = raw.id || `inf_${Date.now()}`
  const payload = {
    id,
    name: raw.name ?? null,
    handle: raw.handle ?? null,
    platform: raw.platform ?? null,
    email: raw.email ?? null,
    phone: raw.phone ?? null,
    referral_code: raw.referralCode ?? raw.referral_code ?? null,
    commission_rate: raw.commissionRate ?? raw.commission_rate ?? 0.1,
    total_commission_paid: raw.totalCommissionPaid ?? raw.total_commission_paid ?? 0,
    status: raw.status ?? null,
    notes: raw.notes ?? null,
  }
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('influencers').insert(payload).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ influencer: data })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { id } = body || {}
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const updates = {
    name: body.name,
    handle: body.handle,
    platform: body.platform,
    email: body.email,
    phone: body.phone,
    referral_code: body.referralCode ?? body.referral_code,
    commission_rate: body.commissionRate ?? body.commission_rate,
    total_commission_paid: body.totalCommissionPaid ?? body.total_commission_paid,
    status: body.status,
    notes: body.notes,
    updated_at: new Date().toISOString(),
  }
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('influencers').update(updates).eq('id', id).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ influencer: data })
}

export async function DELETE(req: Request) {
  const body = await req.json()
  const { id } = body || {}
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const admin = supabaseAdminClient()
  const { error } = await admin.from('influencers').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}