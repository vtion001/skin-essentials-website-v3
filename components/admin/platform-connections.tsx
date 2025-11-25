"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Facebook, 
  Instagram, 
  Plus,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink
} from "lucide-react"
import { SocialPlatformConnection } from "@/lib/admin-services"

interface PlatformConnectionsProps {
  socialMediaService: any
  onConnectionsChange?: () => void
}

export function PlatformConnections({ socialMediaService, onConnectionsChange }: PlatformConnectionsProps) {
  const [connections, setConnections] = useState<SocialPlatformConnection[]>([])
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = () => {
    const platformConnections = socialMediaService.getPlatformConnections()
    setConnections(platformConnections)
  }

  const handleConnectPlatform = async (platform: "facebook" | "instagram") => {
    setIsConnecting(platform)
    
    try {
      // In a real implementation, this would open OAuth flow
      // For demo purposes, we'll simulate a connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newConnection = {
        platform,
        pageId: `${platform}_page_${Date.now()}`,
        pageName: platform === "facebook" ? "Skin Essentials by HER - Facebook" : "Skin Essentials by HER - Instagram",
        accessToken: `demo_token_${Date.now()}`,
        isConnected: true,
        lastSyncTimestamp: new Date().toISOString(),
        webhookVerified: false,
      }
      
      socialMediaService.addPlatformConnection(newConnection)
      loadConnections()
      onConnectionsChange?.()
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error)
    } finally {
      setIsConnecting(null)
    }
  }

  const handleDisconnectPlatform = (connectionId: string) => {
    socialMediaService.removePlatformConnection(connectionId)
    loadConnections()
    onConnectionsChange?.()
  }

  const handleToggleConnection = (connectionId: string, isConnected: boolean) => {
    socialMediaService.updateConnectionStatus(connectionId, !isConnected)
    loadConnections()
    onConnectionsChange?.()
  }

  const getPlatformIcon = (platform: string) => {
    return platform === "facebook" ? 
      <Facebook className="h-5 w-5 text-blue-600" /> : 
      <Instagram className="h-5 w-5 text-pink-600" />
  }

  const getPlatformColor = (platform: string) => {
    return platform === "facebook" ? "border-blue-200 bg-blue-50" : "border-pink-200 bg-pink-50"
  }

  const facebookConnections = connections.filter(conn => conn.platform === "facebook")
  const instagramConnections = connections.filter(conn => conn.platform === "instagram")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Platform Connections</h2>
        <Badge variant="outline" className="text-sm">
          {connections.filter(conn => conn.isConnected).length} Connected
        </Badge>
      </div>

      {/* Facebook Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5 text-blue-600" />
            Facebook Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {facebookConnections.length > 0 ? (
              facebookConnections.map((connection) => (
                <div
                  key={connection.id}
                  className={`p-4 rounded-lg border ${getPlatformColor(connection.platform)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(connection.platform)}
                      <div>
                        <h3 className="font-medium">{connection.pageName}</h3>
                        <p className="text-sm text-gray-500">
                          Page ID: {connection.pageId}
                        </p>
                        <p className="text-xs text-gray-400">
                          Last sync: {connection.lastSyncTimestamp ? new Date(connection.lastSyncTimestamp).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={connection.isConnected ? "default" : "secondary"}>
                        {connection.isConnected ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Disconnected
                          </>
                        )}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleConnection(connection.id, connection.isConnected)}
                      >
                        {connection.isConnected ? "Disconnect" : "Connect"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnectPlatform(connection.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Facebook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Facebook pages connected
                </h3>
                <p className="text-gray-500 mb-4">
                  Connect your Facebook page to manage messages and conversations
                </p>
              </div>
            )}
            
            <Button
              onClick={() => handleConnectPlatform("facebook")}
              disabled={isConnecting === "facebook"}
              className="w-full"
            >
              {isConnecting === "facebook" ? (
                "Connecting..."
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Facebook Page
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instagram Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-600" />
            Instagram Business Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {instagramConnections.length > 0 ? (
              instagramConnections.map((connection) => (
                <div
                  key={connection.id}
                  className={`p-4 rounded-lg border ${getPlatformColor(connection.platform)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(connection.platform)}
                      <div>
                        <h3 className="font-medium">{connection.pageName}</h3>
                        <p className="text-sm text-gray-500">
                          Account ID: {connection.pageId}
                        </p>
                        <p className="text-xs text-gray-400">
                          Last sync: {connection.lastSyncTimestamp ? new Date(connection.lastSyncTimestamp).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={connection.isConnected ? "default" : "secondary"}>
                        {connection.isConnected ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Disconnected
                          </>
                        )}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleConnection(connection.id, connection.isConnected)}
                      >
                        {connection.isConnected ? "Disconnect" : "Connect"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnectPlatform(connection.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Instagram className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Instagram accounts connected
                </h3>
                <p className="text-gray-500 mb-4">
                  Connect your Instagram business account to manage direct messages
                </p>
              </div>
            )}
            
            <Button
              onClick={() => handleConnectPlatform("instagram")}
              disabled={isConnecting === "instagram"}
              className="w-full"
            >
              {isConnecting === "instagram" ? (
                "Connecting..."
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Instagram Account
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connection Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Facebook Page Setup:</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Ensure you have admin access to the Facebook page</li>
                <li>• The page must have messaging enabled</li>
                <li>• You&rsquo;ll need to grant permissions for message management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Instagram Business Account Setup:</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Account must be converted to a business account</li>
                <li>• Must be connected to a Facebook page</li>
                <li>• Direct messaging must be enabled</li>
              </ul>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                <ExternalLink className="h-4 w-4 inline mr-1" />
                For detailed setup instructions, visit our documentation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
