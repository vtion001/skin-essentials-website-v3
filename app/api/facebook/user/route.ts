import { NextRequest, NextResponse } from 'next/server'
import { facebookAPI } from '@/lib/facebook-api'

export async function POST(req: NextRequest) {
  try {
    const { accessToken, userId } = await req.json()
    if (!accessToken || !userId) {
      return NextResponse.json({ error: 'Missing accessToken or userId' }, { status: 400 })
    }

    const result = await facebookAPI.getUserInfo(userId, accessToken)

    // Facebook often returns errors for users with privacy restrictions
    // Return 200 with null user instead of 500 to avoid console spam
    if (result.error) {
      // Only log if it's not a common privacy-related error
      const isPrivacyError = result.error.includes('Unsupported get request') ||
        result.error.includes('Cannot query users by their ID') ||
        result.error.includes('OAuthException')
      if (!isPrivacyError) {
        console.warn('[Facebook User API] Error fetching user:', result.error)
      }
      return NextResponse.json({ user: null, error: result.error }, { status: 200 })
    }
    return NextResponse.json({ user: result.user }, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user info'
    console.warn('[Facebook User API] Exception:', message)
    return NextResponse.json({ user: null, error: message }, { status: 200 })
  }
}