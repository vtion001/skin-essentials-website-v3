'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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

  useEffect(() => {
    checkConnectionStatus()
    handleOAuthCallback()
  }, [])

  const handleOAuthCallback = () => {
    // Check if we're returning from Facebook OAuth
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const platform = urlParams.get('platform')
    const error = urlParams.get('error')
    const message = urlParams.get('message')

    if (success === 'true' && platform === 'facebook') {
      // OAuth was successful, check for connection data in cookies
      const cookies = document.cookie.split(';')
      const connectionCookie = cookies.find(cookie => 
        cookie.trim().startsWith('facebook_connection_temp=')
      )
      
      if (connectionCookie) {
        try {
          const connectionDataStr = connectionCookie.split('=')[1]
          const connectionData = JSON.parse(decodeURIComponent(connectionDataStr))
          
          // Store in localStorage for persistent access
          localStorage.setItem('facebook_connection', JSON.stringify(connectionData))
          
          // Clear the temporary cookie
          document.cookie = 'facebook_connection_temp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          
          // Update connection status
          setConnectionStatus({
            isConnected: true,
            userInfo: connectionData.userInfo,
            grantedPermissions: connectionData.grantedPermissions,
            pages: connectionData.pages,
            connectedAt: connectionData.connectedAt
          })
          
          // Notify parent component
          onConnectionChange?.(true)
          
        } catch (error) {
          console.error('Error parsing connection data:', error)
          setConnectionStatus({
            isConnected: false,
            error: 'Failed to process connection data'
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
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }

  const checkConnectionStatus = async () => {
    try {
      // Check localStorage for stored connection data
      const storedConnection = localStorage.getItem('facebook_connection')
      if (storedConnection) {
        const connectionData = JSON.parse(storedConnection)
        
        // Validate that the connection data is still valid
        if (connectionData.userInfo && connectionData.grantedPermissions) {
          setConnectionStatus({
            isConnected: true,
            userInfo: connectionData.userInfo,
            grantedPermissions: connectionData.grantedPermissions,
            pages: connectionData.pages,
            connectedAt: connectionData.connectedAt
          })
          onConnectionChange?.(true)
        } else {
          // Invalid connection data, clear it
          localStorage.removeItem('facebook_connection')
          setConnectionStatus({ isConnected: false })
          onConnectionChange?.(false)
        }
      } else {
        setConnectionStatus({ isConnected: false })
        onConnectionChange?.(false)
      }
    } catch (error) {
      console.error('Error checking connection status:', error)
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
      // Generate secure OAuth URL
      const loginUrl = facebookAPI.generateLoginUrl({
        includeOptionalPermissions,
        customRedirectUri: `${window.location.origin}/api/auth/facebook`
      })
      
      // Redirect to Facebook OAuth
      window.location.href = loginUrl
    } catch (error) {
      console.error('Error initiating Facebook connection:', error)
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
      
      // In production, you would also revoke the token on Facebook's side
      // and remove the connection from your database
    } catch (error) {
      console.error('Error disconnecting Facebook:', error)
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
              <div className="space-y-3">
                <h4 className="font-medium">Connected Pages ({connectionStatus.pages.length})</h4>
                <div className="space-y-2">
                  {connectionStatus.pages.map((page) => (
                    <div key={page.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <p className="font-medium">{page.name}</p>
                        <p className="text-sm text-muted-foreground">{page.category}</p>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  ))}
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