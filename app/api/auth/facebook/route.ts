import { NextRequest, NextResponse } from 'next/server'
import { facebookAPI } from '@/lib/facebook-api'
import { socialMediaService } from '@/lib/admin-services'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/admin?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    // Verify state parameter
    if (state !== 'facebook_auth') {
      return NextResponse.redirect(
        new URL('/admin?error=invalid_state', request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin?error=no_code', request.url)
      )
    }

    // Exchange code for access token
    const redirectUri = `${request.nextUrl.origin}/api/auth/facebook`
    const userAccessToken = await facebookAPI.exchangeCodeForToken(code, redirectUri)

    // Get user's Facebook pages
    const pages = await facebookAPI.getUserPages(userAccessToken)

    // Store page connections
    for (const page of pages) {
      // Check if page has messaging permissions
      const hasMessagingPermission = page.tasks?.includes('MESSAGING') || 
                                   page.tasks?.includes('MANAGE') ||
                                   true // For demo purposes, assume all pages have permission

      if (hasMessagingPermission) {
        const connection = {
          platform: 'facebook' as const,
          pageId: page.id,
          pageName: page.name,
          accessToken: page.access_token,
          isConnected: true,
          lastSyncTimestamp: new Date().toISOString(),
          webhookVerified: false
        }

        socialMediaService.addPlatformConnection(connection)

        // Subscribe to webhooks
        try {
          await facebookAPI.subscribeToWebhooks(page.access_token, page.id)
          socialMediaService.updateConnectionStatus(page.id, true)
        } catch (webhookError) {
          console.error('Error subscribing to webhooks:', webhookError)
        }
      }
    }

    // Redirect back to admin with success
    return NextResponse.redirect(
      new URL('/admin?facebook_connected=true', request.url)
    )

  } catch (error) {
    console.error('Facebook auth error:', error)
    return NextResponse.redirect(
      new URL(`/admin?error=${encodeURIComponent('auth_failed')}`, request.url)
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'get_login_url') {
      const redirectUri = `${request.nextUrl.origin}/api/auth/facebook`
      const loginUrl = facebookAPI.getLoginUrl(redirectUri)
      
      return NextResponse.json({ loginUrl })
    }

    if (action === 'disconnect') {
      const { pageId } = body
      if (pageId) {
        socialMediaService.removePlatformConnection(pageId)
        return NextResponse.json({ success: true })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Facebook API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}