import { NextRequest, NextResponse } from 'next/server'
import { instagramAPI } from '@/lib/instagram-api'
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
    if (state !== 'instagram_auth') {
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
    const redirectUri = `${request.nextUrl.origin}/api/auth/instagram`
    const shortLivedToken = await instagramAPI.exchangeCodeForToken(code, redirectUri)

    // Get long-lived token
    const longLivedTokenData = await instagramAPI.getLongLivedToken(shortLivedToken)
    const accessToken = longLivedTokenData.access_token

    // Get user info
    const userInfo = await instagramAPI.getUserInfo(accessToken)

    // For Instagram Business accounts, we need to get the connected Facebook pages
    // This requires the user to also connect their Facebook account
    try {
      // Get Facebook pages that have Instagram Business accounts
      const pages = await facebookAPI.getUserPages(accessToken)
      
      for (const page of pages) {
        // Check if this page has an Instagram Business account
        const igAccount = await instagramAPI.getInstagramBusinessAccount(page.access_token, page.id)
        
        if (igAccount) {
          const connection = {
            platform: 'instagram' as const,
            pageId: page.id,
            pageName: `${page.name} (Instagram: @${igAccount.username})`,
            accessToken: page.access_token,
            isConnected: true,
            lastSyncTimestamp: new Date().toISOString(),
            webhookVerified: false
          }

          socialMediaService.addPlatformConnection(connection)

          // Subscribe to webhooks
          try {
            await instagramAPI.subscribeToWebhooks(page.access_token, igAccount.id)
            socialMediaService.updateConnectionStatus(page.id, true)
          } catch (webhookError) {
            console.error('Error subscribing to Instagram webhooks:', webhookError)
          }
        }
      }
    } catch (error) {
      console.error('Error connecting Instagram Business accounts:', error)
      
      // For personal Instagram accounts, create a basic connection
      const connection = {
        platform: 'instagram' as const,
        pageId: userInfo.id,
        pageName: `@${userInfo.username}`,
        accessToken: accessToken,
        isConnected: true,
        lastSyncTimestamp: new Date().toISOString(),
        webhookVerified: false
      }

      socialMediaService.addPlatformConnection(connection)
    }

    // Redirect back to admin with success
    return NextResponse.redirect(
      new URL('/admin?instagram_connected=true', request.url)
    )

  } catch (error) {
    console.error('Instagram auth error:', error)
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
      const redirectUri = `${request.nextUrl.origin}/api/auth/instagram`
      const loginUrl = instagramAPI.getLoginUrl(redirectUri)
      
      return NextResponse.json({ loginUrl })
    }

    if (action === 'disconnect') {
      const { pageId } = body
      if (pageId) {
        socialMediaService.removePlatformConnection(pageId)
        return NextResponse.json({ success: true })
      }
    }

    if (action === 'refresh_token') {
      const { accessToken } = body
      if (accessToken) {
        try {
          const refreshedToken = await instagramAPI.refreshAccessToken(accessToken)
          return NextResponse.json({ 
            success: true, 
            accessToken: refreshedToken.access_token,
            expiresIn: refreshedToken.expires_in
          })
        } catch (error) {
          return NextResponse.json({ error: 'Failed to refresh token' }, { status: 400 })
        }
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Instagram API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}