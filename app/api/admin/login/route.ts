import { NextResponse } from "next/server"
import { supabaseAdminClient } from "@/lib/supabase-admin"
import { supabaseServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { verifyCsrfToken } from "@/lib/utils"

function supabaseEnvOk() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const cookiesMap = new Map<string, string>()
    cookieStore.getAll().forEach(c => cookiesMap.set(c.name, c.value))
    if (!verifyCsrfToken(request.headers, cookiesMap)) {
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 })
    }
    if (!supabaseEnvOk()) {
      return NextResponse.json(
        { success: false, error: "Supabase configuration missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." },
        { status: 500 }
      )
    }
    const { email, password } = await request.json()
    const supabase = await supabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Server error: Failed to initialize Supabase client" }, { status: 500 })
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session) {
      const msg = error?.message || 'Invalid credentials'
      const normalized = /fetch failed/i.test(msg) ?
        'Cannot reach Supabase. Verify NEXT_PUBLIC_SUPABASE_URL and network connectivity.' : msg

      console.error('Login attempt failed:', { email, error: msg })

      try {
        const admin = supabaseAdminClient()
        if (admin) {
          await admin.from('error_logs').insert({
            context: 'admin_login',
            message: normalized,
            meta: { email, raw_error: msg }
          })
        }
      } catch (logErr) {
        console.error('Failed to log login error:', logErr)
      }
      return NextResponse.json({ success: false, error: normalized }, { status: 401 })
    }

    try {
      const admin = supabaseAdminClient()
      if (!admin) {
        throw new Error('Service role client unavailable for authorization check')
      }

      const { data: roleData, error: roleError } = await admin
        .from('admin_users')
        .select('active')
        .eq('user_id', data.user.id)
        .single()

      if (roleError || !roleData || roleData.active !== true) {
        console.warn('Unauthorized login attempt:', { email, userId: data.user.id, error: roleError?.message })
        await supabase.auth.signOut()

        try {
          await admin.from('error_logs').insert({
            context: 'admin_login',
            message: 'Not authorized - No active admin record',
            meta: { email, user_id: data.user.id, db_error: roleError?.message }
          })
        } catch { }
        return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 })
      }
    } catch (authPanic: any) {
      console.error('Authorization panic:', authPanic)
      await supabase.auth.signOut()
      return NextResponse.json({ success: false, error: 'Authorization service failure' }, { status: 500 })
    }

    const requireMfa = Boolean(process.env.ADMIN_MFA_CODE)
    if (requireMfa) {
      return NextResponse.json({ success: true, mfa_required: true })
    }
    return NextResponse.json({ success: true, user: { id: data.user?.id, email: data.user?.email } })
  } catch (error: any) {
    console.error('Fatal Login Error:', error)
    return NextResponse.json({ success: false, error: "Critical server error during login" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const supabase = await supabaseServerClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}