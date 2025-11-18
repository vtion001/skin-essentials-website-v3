import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Simple authentication check
    if (username === "admin" && password === "skinessentials2024") {
      // Create response with cookie
      const response = NextResponse.json({ success: true })
      
      // Set cookie with proper expiration (24 hours)
      const expirationDate = new Date()
      expirationDate.setTime(expirationDate.getTime() + 24 * 60 * 60 * 1000)
      
      const protocol = new URL(request.url).protocol
      response.cookies.set({
        name: "admin_token",
        value: "authenticated",
        expires: expirationDate,
        path: "/",
        httpOnly: false,
        secure: protocol === "https:",
        sameSite: "lax"
      })

      return response
    } else {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  }
}