import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next()
    }
    const response = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res: response })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
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
    return response
  }
  return NextResponse.next()
}

export const config = {
  matcher: "/admin/:path*",
}
