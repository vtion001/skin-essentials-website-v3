import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const testToken = searchParams.get('token')
    
    const response = {
      message: 'Environment check endpoint',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        FACEBOOK_WEBHOOK_VERIFY_TOKEN: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN,
        HAS_FACEBOOK_TOKEN: !!process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN,
        TOKEN_LENGTH: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN?.length,
        TOKEN_PREVIEW: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN?.substring(0, 10) + '...'
      },
      test: {
        providedToken: testToken,
        expectedToken: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN,
        tokensMatch: testToken === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Environment check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}