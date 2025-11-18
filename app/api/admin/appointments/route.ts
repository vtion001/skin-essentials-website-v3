import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const admin = supabaseAdminClient()
    const { data, error } = await admin
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ appointments: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const admin = supabaseAdminClient()
    const { error } = await admin.from('appointments').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}