import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

function generateCsrfToken() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

const rateMap: Map<string, { count: number; ts: number }> = new Map()

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/api/admin")) {
    const isApi = request.nextUrl.pathname.startsWith("/api/admin")

    let response = isApi ? NextResponse.next() : NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Ensure CSRF token exists for all admin/api pages
    const cookies = request.cookies
    const csrf = cookies.get('csrf_token')?.value
    if (!csrf) {
      const token = generateCsrfToken()
      response.cookies.set('csrf_token', token, { httpOnly: false, sameSite: 'lax', path: '/' })
    }

    if (isApi && request.method !== 'GET') {
      const header = request.headers.get('x-csrf-token') || ''
      const cookie = request.cookies.get('csrf_token')?.value || ''
      if (!header || !cookie || header !== cookie) {
        return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
      }
    }

    // Login page exception for UI only
    if (request.nextUrl.pathname === "/admin/login") {
      return response
    }

    // API login/mfa endpoints must be accessible without existing session
    if (request.nextUrl.pathname === "/api/admin/login" || request.nextUrl.pathname === "/api/admin/mfa") {
      return response
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'undefined') {
      if (isApi) return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
      return response
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, { ...options, sameSite: 'lax', secure: true })
            })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      if (isApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const url = new URL("/admin/login", request.url)
      url.searchParams.set("error", "no_session")
      return NextResponse.redirect(url)
    }

    const { data: roleData, error: roleError } = await supabase
      .from("admin_users")
      .select("active")
      .eq("user_id", user.id)
      .single()

    if (!roleData || roleError || roleData.active !== true) {
      if (isApi) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const url = new URL("/admin/login", request.url)
      url.searchParams.set("error", "not_admin")
      return NextResponse.redirect(url)
    }

    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

    // MFA Check
    const requireMfa = Boolean(process.env.ADMIN_MFA_CODE)
    const mfaOk = cookies.get('mfa_ok')?.value === '1'
    if (requireMfa && !mfaOk) {
      if (isApi) return NextResponse.json({ error: 'MFA Required' }, { status: 401 })
      const url = new URL("/admin/login", request.url)
      url.searchParams.set("error", "mfa_required")
      return NextResponse.redirect(url)
    }

    return response
  }


  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
