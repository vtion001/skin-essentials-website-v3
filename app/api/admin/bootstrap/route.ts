import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdminClient } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-bootstrap-token')
  if (!token || token !== process.env.ADMIN_BOOTSTRAP_TOKEN) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Missing email or password' }, { status: 400 })
    }
    const supabase = supabaseAdminClient()

    const createRes = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    let userId = createRes.data.user?.id
    if (createRes.error && createRes.error.message?.toLowerCase().includes('already')) {
      const list = await supabase.auth.admin.listUsers()
      const existing = list.data.users?.find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase())
      if (!existing) {
        return NextResponse.json({ ok: false, error: 'User exists but could not be found' }, { status: 500 })
      }
      userId = existing.id
      await supabase.auth.admin.updateUserById(userId, { password, email_confirm: true })
    }
    if (!userId) {
      return NextResponse.json({ ok: false, error: createRes.error?.message || 'Failed to create user' }, { status: 500 })
    }
    await supabase.from('admin_users').upsert({ user_id: userId, email, active: true })
    return NextResponse.json({ ok: true, user_id: userId })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Bootstrap failed' }, { status: 500 })
  }
}