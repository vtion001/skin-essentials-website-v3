import { NextRequest, NextResponse } from 'next/server'
import { facebookAPI } from '@/lib/facebook-api'
import { socialMediaService } from '@/lib/admin-services'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const state = searchParams.get('state')

  console.log('Facebook OAuth callback received:', { code: !!code, error, state: !!state })

  // Handle OAuth errors from Facebook
  if (error) {
    console.error('Facebook OAuth error:', { error, errorDescription })
    
    let errorMessage = 'Facebook authentication failed'
    if (error === 'access_denied') {
      errorMessage = 'You denied access to Facebook. Please grant the required permissions to continue.'
    } else if (errorDescription) {
      errorMessage = errorDescription
    }
    
    return NextResponse.redirect(
      new URL(`/admin?error=${encodeURIComponent(errorMessage)}`, request.url)
    )
  }

  // Validate required parameters
  if (!code) {
    console.error('No authorization code received from Facebook')
    return NextResponse.redirect(
      new URL('/admin?error=No authorization code received from Facebook', request.url)
    )
  }

  if (!state) {
    console.error('No state parameter received from Facebook')
    return NextResponse.redirect(
      new URL('/admin?error=Invalid authentication request', request.url)
    )
  }

  try {
    console.log('Exchanging Facebook authorization code for access token...')
    
    // Exchange code for access token with comprehensive validation
    const tokenResult = await facebookAPI.exchangeCodeForToken(code, state)
    
    if (tokenResult.error) {
      console.error('Facebook token exchange failed:', tokenResult.error)
      return NextResponse.redirect(
        new URL(`/admin?error=${encodeURIComponent(tokenResult.error)}`, request.url)
      )
    }

    const { accessToken, userInfo, grantedPermissions } = tokenResult

    console.log('Facebook authentication successful for user:', userInfo?.name)
    console.log('Granted permissions:', grantedPermissions)

    // Get user pages with the new access token
    let pagesResult
    try {
      pagesResult = await facebookAPI.getUserPages(accessToken!)
    } catch (error) {
      console.error('Failed to fetch user pages:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return NextResponse.redirect(
        new URL(`/admin?error=${encodeURIComponent(`Failed to fetch pages: ${errorMessage}`)}`, request.url)
      )
    }

    console.log(`Successfully fetched ${pagesResult.length || 0} Facebook pages`)

    // Prepare connection data for secure storage
     const connectionData = {
       platform: 'facebook',
       accessToken: accessToken,
       userInfo: userInfo,
       grantedPermissions: grantedPermissions,
       pages: pagesResult,
       connectedAt: new Date().toISOString(),
       expiresAt: null // Facebook tokens don't expire by default for pages
     }

     // Store connections for each page in the social media service
     for (const page of pagesResult) {
       const pageConnectionData = {
         ...connectionData,
         pageInfo: page,
         pageId: page.id,
         pageName: page.name,
         pageAccessToken: page.access_token
       }
       
       // Store the connection (in production, this would be saved to database)
       socialMediaService.addPlatformConnection(page.id, pageConnectionData)
     }

    // Store connection data in a way that the client can access it
    // In production, this should be stored in a secure database and associated with the user session
    const connectionDataForClient = JSON.stringify(connectionData)
    
    console.log('Facebook OAuth completed successfully')
    
    // Create a response that will store the connection data and redirect
    const response = NextResponse.redirect(
      new URL('/admin?success=true&platform=facebook', request.url)
    )
    
    // Set a secure cookie with the connection data (temporary, for demo purposes)
    // In production, you should use proper session management and database storage
    response.cookies.set('facebook_connection_temp', connectionDataForClient, {
      httpOnly: false, // Allow client-side access for this demo
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300 // 5 minutes, just enough time to transfer to localStorage
    })
    
    return response

  } catch (error) {
    console.error('Facebook OAuth error:', error)
    
    let errorMessage = 'Authentication failed'
    let errorCode = 'unknown_error'
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Handle specific Facebook API errors
      if (error.message.includes('access_denied')) {
        errorCode = 'access_denied'
        errorMessage = 'User denied access to Facebook account'
      } else if (error.message.includes('invalid_grant')) {
        errorCode = 'invalid_grant'
        errorMessage = 'Invalid authorization code. Please try again.'
      } else if (error.message.includes('expired')) {
        errorCode = 'expired_code'
        errorMessage = 'Authorization code expired. Please try again.'
      } else if (error.message.includes('insufficient_permissions')) {
        errorCode = 'insufficient_permissions'
        errorMessage = 'Insufficient permissions granted. Please ensure all required permissions are accepted.'
      } else if (error.message.includes('network')) {
        errorCode = 'network_error'
        errorMessage = 'Network error occurred. Please check your connection and try again.'
      } else if (error.message.includes('rate_limit')) {
        errorCode = 'rate_limit'
        errorMessage = 'Too many requests. Please wait a moment and try again.'
      }
    }
    
    // Log detailed error for debugging
    console.error('Facebook OAuth detailed error:', {
      errorCode,
      errorMessage,
      originalError: error,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.redirect(
      new URL(`/admin?error=${errorCode}&message=${encodeURIComponent(errorMessage)}`, request.url)
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