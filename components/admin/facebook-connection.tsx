'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Facebook, 
  Shield, 
  Users, 
  MessageSquare,
  Settings,
  Eye,
  Edit,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { 
  FACEBOOK_PERMISSIONS, 
  REQUIRED_PERMISSIONS, 
  OPTIONAL_PERMISSIONS, 
  PERMISSION_DESCRIPTIONS,
  facebookAPI 
} from '@/lib/facebook-api'
import { socialMediaService } from '@/lib/admin-services'

interface FacebookConnectionProps {
  onConnectionChange?: (connected: boolean) => void
}

interface ConnectionStatus {
  isConnected: boolean
  userInfo?: {
    id: string
    name: string
    email?: string
    profile_pic?: string
  }
  grantedPermissions?: string[]
  pages?: Array<{
    id: string
    name: string
    access_token: string
    category: string
  }>
  connectedAt?: string
  error?: string
}

const getPermissionIcon = (permission: string) => {
  switch (permission) {
    case FACEBOOK_PERMISSIONS.PUBLIC_PROFILE:
      return <Users className="h-4 w-4" />
    case FACEBOOK_PERMISSIONS.EMAIL:
      return <Shield className="h-4 w-4" />
    case FACEBOOK_PERMISSIONS.PAGES_MESSAGING:
      return <MessageSquare className="h-4 w-4" />
    case FACEBOOK_PERMISSIONS.PAGES_MANAGE_METADATA:
      return <Settings className="h-4 w-4" />
    case FACEBOOK_PERMISSIONS.PAGES_READ_ENGAGEMENT:
      return <Eye className="h-4 w-4" />
    case FACEBOOK_PERMISSIONS.PAGES_MANAGE_POSTS:
      return <Edit className="h-4 w-4" />
    default:
      return <Shield className="h-4 w-4" />
  }
}

export function FacebookConnection({ onConnectionChange }: FacebookConnectionProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [includeOptionalPermissions, setIncludeOptionalPermissions] = useState(false)
  const [showPermissionDetails, setShowPermissionDetails] = useState(false)
  const [renderTick, setRenderTick] = useState(0)
  const [pageSearch, setPageSearch] = useState('')
  const [onlyVisible, setOnlyVisible] = useState(false)
  const [compactView, setCompactView] = useState(false)
  const [brokenAvatars, setBrokenAvatars] = useState<Record<string, boolean>>({})
  const safeParseCookieJSON = (raw: string) => {
    let v = raw
    for (let i = 0; i < 3; i++) {
      try {
        const cleaned = v.replace(/^"|"$/g, '')
        return JSON.parse(cleaned)
      } catch {}
      try {
        v = decodeURIComponent(v)
      } catch {
        break
      }
    }
    return null
  }

  useEffect(() => {
    checkConnectionStatus()
    handleOAuthCallback()
  }, [])

  const handleOAuthCallback = async () => {
    // Check if we're returning from Facebook OAuth
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const platform = urlParams.get('platform')
    const error = urlParams.get('error')
    const message = urlParams.get('message')

    // Process connection cookie first (handles cases where query params were lost due to redirects)
    try {
      const cookies = document.cookie.split(';')
      const connectionCookie = cookies.find(c => c.trim().startsWith('facebook_connection_temp='))
      if (connectionCookie) {
        const raw = connectionCookie.split('=')[1]
        const data = safeParseCookieJSON(raw)
        if (!data) throw new Error('Invalid cookie JSON')
        console.log('[FB_STATUS] oauth success (cookie-first)')

        localStorage.setItem('facebook_connection', JSON.stringify(data))
        document.cookie = 'facebook_connection_temp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

        // Ensure client service has platform connections
        try {
          const pages = Array.isArray(data.pages) ? data.pages : []
          for (const page of pages) {
            socialMediaService.addPlatformConnection({
              platform: 'facebook',
              pageId: page.id,
              pageName: page.name,
              accessToken: page.access_token,
              isConnected: true,
              lastSyncTimestamp: new Date().toISOString(),
              webhookVerified: false
            })
            try {
              const subscribed = await facebookAPI.subscribeToWebhooks(page.access_token, page.id)
              if (subscribed) {
                const conns = socialMediaService.getPlatformConnections()
                const conn = conns.find((c: any) => c.platform === 'facebook' && c.pageId === page.id)
                if (conn) {
                  conn.webhookVerified = true
                  socialMediaService.saveData()
                }
              }
            } catch {}
          }
          console.log('[FB_STATUS] client service updated with', pages.length, 'pages')
        } catch (ingErr) {
          console.error('[FB_STATUS] client ingestion error', ingErr)
        }

        setConnectionStatus({
          isConnected: true,
          userInfo: data.userInfo,
          grantedPermissions: data.grantedPermissions,
          pages: data.pages,
          connectedAt: data.connectedAt
        })
        onConnectionChange?.(true)
        window.history.replaceState({}, document.title, window.location.pathname)
        return
      }
    } catch (cookieErr) {
      console.error('[FB_STATUS] cookie processing error', cookieErr)
    }

    if (success === 'true' && platform === 'facebook') {
      // OAuth was successful, check for connection data in cookies
      const cookies = document.cookie.split(';')
      const connectionCookie = cookies.find(cookie => 
        cookie.trim().startsWith('facebook_connection_temp=')
      )
      
      if (connectionCookie) {
        try {
          const connectionDataStr = connectionCookie.split('=')[1]
          const connectionData = safeParseCookieJSON(connectionDataStr)
          if (!connectionData) throw new Error('Invalid cookie JSON')
          console.log('[FB_STATUS] oauth success')
          
          // Store in localStorage for persistent access
          localStorage.setItem('facebook_connection', JSON.stringify(connectionData))
          
          // Clear the temporary cookie
          document.cookie = 'facebook_connection_temp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          
          // Ingest connections into client-side service for UI
          try {
            const pages = Array.isArray(connectionData.pages) ? connectionData.pages : []
            for (const page of pages) {
              socialMediaService.addPlatformConnection({
                platform: 'facebook',
                pageId: page.id,
                pageName: page.name,
                accessToken: page.access_token,
                isConnected: true,
                lastSyncTimestamp: new Date().toISOString(),
                webhookVerified: false
              })
              try {
                const subscribed = await facebookAPI.subscribeToWebhooks(page.access_token, page.id)
                if (subscribed) {
                  const conns = socialMediaService.getPlatformConnections()
                  const conn = conns.find((c: any) => c.platform === 'facebook' && c.pageId === page.id)
                  if (conn) {
                    conn.webhookVerified = true
                    socialMediaService.saveData()
                  }
                }
              } catch {}
            }
            console.log('[FB_STATUS] client service updated with', pages.length, 'pages')
          } catch (err) {
            console.error('[FB_STATUS] failed to update client service', err)
          }

          // Update connection status
          setConnectionStatus({
            isConnected: true,
            userInfo: connectionData.userInfo,
            grantedPermissions: connectionData.grantedPermissions,
            pages: connectionData.pages,
            connectedAt: connectionData.connectedAt
          })
          console.log('[FB_STATUS] connected pages', connectionData.pages?.length || 0)
          
          // Notify parent component
          onConnectionChange?.(true)
          
        } catch (error) {
          console.error('Error parsing connection data:', error)
          console.error('[FB_STATUS] parse error')
          setConnectionStatus({
            isConnected: false,
            error: 'Failed to process connection data'
          })
        }
      } else {
        // Cookie missing: try to fetch server-side connections and ingest for UI
        console.warn('[FB_STATUS] success flag without cookie; attempting server-side connections fetch')
        try {
          const res = await fetch('/api/auth/facebook?connections=true')
          const payload = await res.json()
          const connections = Array.isArray(payload.connections) ? payload.connections : []
          if (connections.length > 0) {
            connections.forEach((pageConn: any) => {
              socialMediaService.addPlatformConnection(pageConn)
            })
            setConnectionStatus({ isConnected: true })
            onConnectionChange?.(true)
            console.log('[FB_STATUS] server connections ingested', connections.length)
          } else {
            setConnectionStatus({
              isConnected: false,
              error: 'Missing connection data after OAuth. Please reconnect.'
            })
            console.error('[FB_STATUS] oauth success without cookie — no server connections')
          }
        } catch (err) {
          console.error('[FB_STATUS] server connections fetch failed', err)
          setConnectionStatus({
            isConnected: false,
            error: 'Failed to fetch connection data. Please reconnect.'
          })
        }
      }
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
      
    } else if (error) {
      // OAuth failed - handle specific error codes
      let errorMessage = 'Facebook connection failed'
      
      if (message) {
        errorMessage = decodeURIComponent(message)
      } else {
        // Provide user-friendly messages for specific error codes
        switch (error) {
          case 'access_denied':
            errorMessage = 'Access denied. Please accept the required permissions to connect your Facebook account.'
            break
          case 'invalid_grant':
            errorMessage = 'Invalid authorization. Please try connecting again.'
            break
          case 'expired_code':
            errorMessage = 'Authorization expired. Please try connecting again.'
            break
          case 'insufficient_permissions':
            errorMessage = 'Insufficient permissions. Please ensure all required permissions are accepted.'
            break
          case 'network_error':
            errorMessage = 'Network error. Please check your connection and try again.'
            break
          case 'rate_limit':
            errorMessage = 'Too many requests. Please wait a moment and try again.'
            break
          default:
            errorMessage = 'Facebook connection failed. Please try again.'
        }
      }
      
      setConnectionStatus({
        isConnected: false,
        error: errorMessage
      })
      console.error('[FB_STATUS] oauth error', errorMessage)
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }

  const checkConnectionStatus = async () => {
    try {
      console.log('[FB_STATUS] checkConnectionStatus')
      // Check localStorage for stored connection data
      const storedConnection = localStorage.getItem('facebook_connection')
      if (storedConnection) {
        const connectionData = JSON.parse(storedConnection)
        
        // Validate that the connection data is still valid
        if (connectionData.userInfo && connectionData.grantedPermissions) {
          // Ensure platform connections exist for readers
          try {
            const existing = socialMediaService.getPlatformConnections().filter((c: any) => c.platform === 'facebook')
            if (existing.length === 0 && Array.isArray(connectionData.pages)) {
              connectionData.pages.forEach((page: any) => {
                socialMediaService.addPlatformConnection({
                  platform: 'facebook',
                  pageId: page.id,
                  pageName: page.name,
                  accessToken: page.access_token,
                  isConnected: true,
                  lastSyncTimestamp: new Date().toISOString(),
                  webhookVerified: false
                })
              })
              console.log('[FB_STATUS] rebuilt platform connections from stored connection')
            }
          } catch (err) {
            console.error('[FB_STATUS] rebuild connections error', err)
          }
          setConnectionStatus({
            isConnected: true,
            userInfo: connectionData.userInfo,
            grantedPermissions: connectionData.grantedPermissions,
            pages: connectionData.pages,
            connectedAt: connectionData.connectedAt
          })
          onConnectionChange?.(true)
          console.log('[FB_STATUS] status connected')
        } else {
          // Invalid connection data, clear it
          localStorage.removeItem('facebook_connection')
          setConnectionStatus({ isConnected: false })
          onConnectionChange?.(false)
          console.log('[FB_STATUS] status cleared')
        }
      } else {
        setConnectionStatus({ isConnected: false })
        onConnectionChange?.(false)
        console.log('[FB_STATUS] no stored connection')
      }
    } catch (error) {
      console.error('Error checking connection status:', error)
      console.error('[FB_STATUS] status check failed')
      // Clear potentially corrupted data
      localStorage.removeItem('facebook_connection')
      setConnectionStatus({ 
        isConnected: false, 
        error: 'Failed to check connection status' 
      })
      onConnectionChange?.(false)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const res = await fetch('/api/auth/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_login_url' })
      })
      const data = await res.json()
      if (data.loginUrl) {
        console.log('[FB_STATUS] redirecting to login url')
        window.location.href = data.loginUrl
      } else {
        setConnectionStatus({
          isConnected: false,
          error: 'Failed to get Facebook login URL'
        })
        setIsConnecting(false)
        console.error('[FB_STATUS] failed to get login url')
      }
    } catch (error) {
      console.error('Error initiating Facebook connection:', error)
      console.error('[FB_STATUS] connect error')
      setConnectionStatus({
        isConnected: false,
        error: 'Failed to initiate Facebook connection'
      })
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      // Clear stored connection data
      localStorage.removeItem('facebook_connection')
      
      // Update state
      setConnectionStatus({ isConnected: false })
      onConnectionChange?.(false)
      console.log('[FB_STATUS] disconnected')
      
      // In production, you would also revoke the token on Facebook's side
      // and remove the connection from your database
    } catch (error) {
      console.error('Error disconnecting Facebook:', error)
      console.error('[FB_STATUS] disconnect error')
      setConnectionStatus({
        ...connectionStatus,
        error: 'Failed to disconnect Facebook account'
      })
    }
  }

  const renderPermissionList = (permissions: string[], title: string, required: boolean) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="font-medium text-sm">{title}</h4>
        <Badge variant={required ? "destructive" : "secondary"} className="text-xs">
          {required ? "Required" : "Optional"}
        </Badge>
      </div>
      <div className="space-y-2">
        {permissions.map((permission) => {
          const description = PERMISSION_DESCRIPTIONS[permission as keyof typeof PERMISSION_DESCRIPTIONS]
          const isGranted = connectionStatus.grantedPermissions?.includes(permission)
          
          return (
            <div key={permission} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <div className="flex-shrink-0 mt-0.5">
                {getPermissionIcon(permission)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{description?.title}</p>
                  {connectionStatus.isConnected && (
                    <div className="flex-shrink-0">
                      {isGranted ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {description?.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900">
            <Facebook className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Facebook Connection
              {connectionStatus.isConnected && (
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Connected
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Connect your Facebook account to manage pages and messages
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {connectionStatus.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{connectionStatus.error}</AlertDescription>
          </Alert>
        )}

        {!connectionStatus.isConnected ? (
          <div className="space-y-6">
            {/* Permission Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Permission Settings</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPermissionDetails(!showPermissionDetails)}
                >
                  {showPermissionDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="optional-permissions"
                  checked={includeOptionalPermissions}
                  onCheckedChange={setIncludeOptionalPermissions}
                />
                <label htmlFor="optional-permissions" className="text-sm font-medium">
                  Request optional permissions for enhanced functionality
                </label>
              </div>

              {showPermissionDetails && (
                <div className="space-y-6">
                  {renderPermissionList(REQUIRED_PERMISSIONS, "Required Permissions", true)}
                  {includeOptionalPermissions && (
                    <>
                      <Separator />
                      {renderPermissionList(OPTIONAL_PERMISSIONS, "Optional Permissions", false)}
                    </>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Connection Action */}
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  You'll be redirected to Facebook to authorize the required permissions. 
                  Your data is handled securely and only used for the specified purposes.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="w-full"
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Facebook className="mr-2 h-4 w-4" />
                    Connect Facebook Account
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connected User Info */}
            {connectionStatus.userInfo && (
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-4">
                  {connectionStatus.userInfo.profile_pic && (
                    <img
                      src={connectionStatus.userInfo.profile_pic}
                      alt={connectionStatus.userInfo.name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium">{connectionStatus.userInfo.name}</p>
                    {connectionStatus.userInfo.email && (
                      <p className="text-sm text-muted-foreground">
                        {connectionStatus.userInfo.email}
                      </p>
                    )}
                    {connectionStatus.connectedAt && (
                      <p className="text-xs text-muted-foreground">
                        Connected {new Date(connectionStatus.connectedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Disconnect
                </Button>
              </div>
            )}

            {/* Connected Pages */}
            {connectionStatus.pages && connectionStatus.pages.length > 0 && (
              <div className="space-y-4" aria-live="polite">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="font-medium">Connected Pages ({connectionStatus.pages.length})</h4>
                  <div className="ml-auto flex items-center gap-2">
                    <Input
                      value={pageSearch}
                      onChange={(e) => setPageSearch(e.target.value)}
                      placeholder="Search pages"
                      aria-label="Search connected pages"
                      className="h-8 w-[200px]"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Only visible</span>
                      <Switch
                        checked={onlyVisible}
                        onCheckedChange={setOnlyVisible}
                        aria-label="Toggle showing only visible pages"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Compact</span>
                      <Switch
                        checked={compactView}
                        onCheckedChange={setCompactView}
                        aria-label="Toggle compact view"
                      />
                    </div>
                  </div>
                </div>
                <div role="list" className={compactView ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2" : "grid grid-cols-1 sm:grid-cols-2 gap-3"}>
                  {connectionStatus.pages
                    .filter((p) => {
                      const q = pageSearch.trim().toLowerCase()
                      const matches = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
                      if (!onlyVisible) return matches
                      const conns = socialMediaService.getPlatformConnections()
                      const conn = conns.find((c: any) => c.platform === 'facebook' && c.pageId === p.id)
                      return matches && !!conn?.isConnected
                    })
                    .map((page) => {
                      const conns = socialMediaService.getPlatformConnections()
                      const conn = conns.find((c: any) => c.platform === 'facebook' && c.pageId === page.id)
                      const visible = !!conn?.isConnected
                      const avatarUrl = `https://graph.facebook.com/${page.id}/picture?type=large`
                      return (
                        <div
                          key={page.id}
                          role="listitem"
                          className={compactView ? "group relative p-3 rounded-lg border bg-gradient-to-br from-background to-background/70 hover:from-accent/5 hover:to-accent/10 shadow-xs hover:shadow-md transition-all duration-300 hover:scale-[1.005] focus-within:ring-2 focus-within:ring-ring" : "group relative p-4 rounded-xl border bg-gradient-to-br from-background to-background/70 hover:from-accent/5 hover:to-accent/10 shadow-xs hover:shadow-lg transition-all duration-300 hover:scale-[1.01] focus-within:ring-2 focus-within:ring-ring"}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={compactView ? "h-8 w-8 rounded-full ring-2 ring-blue-200 overflow-hidden bg-gray-100 grid place-items-center" : "h-10 w-10 rounded-full ring-2 ring-blue-200 overflow-hidden bg-gray-100 grid place-items-center"}>
                                {!brokenAvatars[page.id] ? (
                                  <img
                                    src={avatarUrl}
                                    alt={page.name}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                    onError={() => setBrokenAvatars(prev => ({ ...prev, [page.id]: true }))}
                                  />
                                ) : (
                                  <span className="text-sm font-semibold text-gray-600">{page.name.charAt(0)}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className={compactView ? "font-semibold text-sm truncate" : "font-semibold truncate"}>{page.name}</p>
                                <p className={compactView ? "text-xs text-muted-foreground truncate" : "text-sm text-muted-foreground truncate"}>{page.category}</p>
                              </div>
                            </div>
                            <Badge variant={visible ? 'default' : 'outline'} className={visible ? 'bg-green-500 text-white' : ''}>
                              {visible ? 'Visible' : 'Hidden'}
                            </Badge>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className={compactView ? "text-xs" : "text-sm"}>Show in conversations</span>
                              <Switch
                                checked={visible}
                                onCheckedChange={(checked) => {
                                  const cs = socialMediaService.getPlatformConnections()
                                  const c = cs.find((x: any) => x.platform === 'facebook' && x.pageId === page.id)
                                  if (c) {
                                    socialMediaService.updateConnectionStatus(c.id, !!checked)
                                    setRenderTick((t) => t + 1)
                                  }
                                }}
                                aria-label={`Toggle visibility for ${page.name}`}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size={compactView ? "icon" : "sm"}
                                aria-label={`Sync messages for ${page.name}`}
                                onClick={async () => {
                                  await socialMediaService.syncMessagesFromPlatform('facebook')
                                }}
                                className="transition-all hover:shadow-md"
                              >
                                {compactView ? '↻' : 'Sync'}
                              </Button>
                              <Button
                                variant="outline"
                                size={compactView ? "icon" : "sm"}
                                aria-label={`Open page settings for ${page.name}`}
                                className="transition-all hover:shadow-md"
                                onClick={() => {
                                  const url = `https://facebook.com/${page.id}`
                                  window.open(url, '_blank', 'noopener,noreferrer')
                                }}
                              >
                                {compactView ? '⚙︎' : 'Manage'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Permission Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Permission Status</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPermissionDetails(!showPermissionDetails)}
                >
                  {showPermissionDetails ? 'Hide' : 'Show'} Details
                </Button>
              </div>

              {showPermissionDetails && connectionStatus.grantedPermissions && (
                <div className="space-y-4">
                  {renderPermissionList(REQUIRED_PERMISSIONS, "Required Permissions", true)}
                  <Separator />
                  {renderPermissionList(OPTIONAL_PERMISSIONS, "Optional Permissions", false)}
                </div>
              )}
            </div>

            <Separator />

            {/* Disconnect Action */}
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Disconnecting will remove access to your Facebook pages and stop message synchronization.
                </AlertDescription>
              </Alert>

              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
                className="w-full"
              >
                Disconnect Facebook Account
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}