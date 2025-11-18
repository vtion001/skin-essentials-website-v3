import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session) {
      const msg = error?.message || 'Invalid credentials'
      try {
        const admin = supabaseAdminClient()
        await admin.from('error_logs').insert({ context: 'admin_login', message: msg, meta: { email } })
      } catch {}
      return NextResponse.json({ success: false, error: msg }, { status: 401 })
    }
    try {
      const role = await supabase.from('admin_users').select('active').eq('user_id', data.user!.id).single()
      if (role.error || !role.data || role.data.active !== true) {
        await supabase.auth.signOut()
        try {
          const admin = supabaseAdminClient()
          await admin.from('error_logs').insert({ context: 'admin_login', message: 'Not authorized', meta: { email, user_id: data.user?.id } })
        } catch {}
        return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 })
      }
    } catch {}
    return NextResponse.json({ success: true, user: { id: data.user?.id, email: data.user?.email } })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 })
  }
}

export async function DELETE() {
  try {
    const supabase = supabaseServerClient()
    await supabase.auth.signOut()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}