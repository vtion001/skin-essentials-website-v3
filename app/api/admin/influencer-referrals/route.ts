import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"

export async function GET() {
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('influencer_referrals').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ referrals: data || [] })
}

export async function POST(req: Request) {
  const body = await req.json()
  const admin = supabaseAdminClient()
  const { data, error } = await admin.from('influencer_referrals').insert(body).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ referral: data })
}

export async function DELETE(req: Request) {
  const body = await req.json()
  const { id } = body || {}
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const admin = supabaseAdminClient()
  const { error } = await admin.from('influencer_referrals').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}