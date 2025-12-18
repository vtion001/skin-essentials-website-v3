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
  if (request.nextUrl.pathname.startsWith("/admin")) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Ensure CSRF token exists for all admin pages, including login
    const cookies = request.cookies
    const csrf = cookies.get('csrf_token')?.value
    if (!csrf) {
      const token = generateCsrfToken()
      response.cookies.set('csrf_token', token, { httpOnly: false, sameSite: 'strict', path: '/' })
    }

    // Login page exception - still need to setup client to refresh session if needed
    if (request.nextUrl.pathname === "/admin/login") {
      return response
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Skip Supabase check if env vars are missing
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'undefined') {
      // Allow access if no Supabase configured, let the page handle it
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
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const url = new URL("/admin/login", request.url)
      url.searchParams.set("error", "no_session")
      return NextResponse.redirect(url)
    }

    const roleCheck = await supabase
      .from("admin_users")
      .select("active")
      .eq("user_id", user.id)
      .single()

    if (!roleCheck.data || roleCheck.error || roleCheck.data.active !== true) {
      const url = new URL("/admin/login", request.url)
      url.searchParams.set("error", "not_admin")
      return NextResponse.redirect(url)
    }

    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

    // MFA Check
    const requireMfa = Boolean(process.env.ADMIN_MFA_CODE)
    const mfaOk = cookies.get('mfa_ok')?.value === '1'
    if (requireMfa && !mfaOk) {
      const url = new URL("/admin/login", request.url)
      url.searchParams.set("error", "mfa_required")
      return NextResponse.redirect(url)
    }

    return response
  }

  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    if (request.method !== 'GET') {
      const header = request.headers.get('x-csrf-token') || ''
      const cookie = request.cookies.get('csrf_token')?.value || ''
      if (!header || !cookie || header !== cookie) {
        return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
      }
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local'
      const now = Date.now()
      const slot = Math.floor(now / 60000)
      const key = `${ip}:${slot}`
      const cur = rateMap.get(key) || { count: 0, ts: slot }
      cur.count += 1
      rateMap.set(key, cur)
      if (cur.count > 60) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
      }
    }
    const response = NextResponse.next()
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
