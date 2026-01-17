"use client"

import { useState, useEffect, useCallback } from "react"

// ================================
// Types
// ================================

export interface FacebookPage {
    id: string
    name: string
    access_token: string
    category: string
}

export interface FacebookUserInfo {
    id: string
    name: string
    email?: string
    profile_pic?: string
}

export interface ConnectionStatus {
    isConnected: boolean
    userInfo?: FacebookUserInfo
    grantedPermissions?: string[]
    pages?: FacebookPage[]
    connectedAt?: string
    error?: string
}

interface UseFacebookAuthProps {
    onConnectionChange?: (connected: boolean) => void
}

interface UseFacebookAuthReturn {
    connectionStatus: ConnectionStatus
    isConnecting: boolean
    includeOptionalPermissions: boolean
    setIncludeOptionalPermissions: (v: boolean) => void
    handleConnect: () => Promise<void>
    handleDisconnect: () => Promise<void>
    checkConnectionStatus: () => Promise<void>
    handleOAuthCallback: () => Promise<void>
}

/**
 * Hook for managing Facebook OAuth authentication
 * Handles connection, disconnection, and OAuth callback processing
 */
export function useFacebookAuth({
    onConnectionChange,
}: UseFacebookAuthProps): UseFacebookAuthReturn {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        isConnected: false,
    })
    const [isConnecting, setIsConnecting] = useState(false)
    const [includeOptionalPermissions, setIncludeOptionalPermissions] = useState(false)

    // Check connection status from API
    const checkConnectionStatus = useCallback(async () => {
        try {
            const response = await fetch("/api/facebook/status")
            if (!response.ok) {
                setConnectionStatus({ isConnected: false })
                onConnectionChange?.(false)
                return
            }

            const data = await response.json()
            const newStatus: ConnectionStatus = {
                isConnected: data.connected || false,
                userInfo: data.user,
                grantedPermissions: data.permissions,
                pages: data.pages,
                connectedAt: data.connectedAt,
            }

            setConnectionStatus(newStatus)
            onConnectionChange?.(newStatus.isConnected)
        } catch (error) {
            console.error("Error checking connection status:", error)
            setConnectionStatus({ isConnected: false })
            onConnectionChange?.(false)
        }
    }, [onConnectionChange])

    // Handle OAuth callback after redirect from Facebook
    const handleOAuthCallback = useCallback(async () => {
        // Check if we're returning from Facebook OAuth
        if (typeof window === "undefined") return

        const params = new URLSearchParams(window.location.search)
        const code = params.get("code")
        const state = params.get("state")
        const error = params.get("error")

        // Not an OAuth callback
        if (!code && !error) return

        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname)

        if (error) {
            const errorDescription = params.get("error_description")
            console.error("Facebook OAuth error:", error, errorDescription)
            setConnectionStatus({
                isConnected: false,
                error: errorDescription || error,
            })
            return
        }

        if (!code) return

        setIsConnecting(true)

        try {
            // Exchange code for tokens via our API
            const response = await fetch("/api/auth/facebook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "exchange_code", code, state }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to complete OAuth")
            }

            const data = await response.json()

            // Update connection status
            const newStatus: ConnectionStatus = {
                isConnected: true,
                userInfo: data.user,
                grantedPermissions: data.permissions,
                pages: data.pages,
                connectedAt: new Date().toISOString(),
            }

            setConnectionStatus(newStatus)
            onConnectionChange?.(true)
        } catch (error) {
            console.error("OAuth callback error:", error)
            setConnectionStatus({
                isConnected: false,
                error: error instanceof Error ? error.message : "OAuth failed",
            })
        } finally {
            setIsConnecting(false)
        }
    }, [onConnectionChange])

    // Initiate Facebook connection
    const handleConnect = useCallback(async () => {
        setIsConnecting(true)

        try {
            const response = await fetch("/api/auth/facebook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "get_login_url" }),
            })

            const data = await response.json()

            if (data.loginUrl) {
                console.log("[FB_AUTH] Redirecting to login URL")
                window.location.href = data.loginUrl
            } else {
                setConnectionStatus({
                    isConnected: false,
                    error: "Failed to get Facebook login URL",
                })
                setIsConnecting(false)
            }
        } catch (error) {
            console.error("Error initiating Facebook connect:", error)
            setConnectionStatus({
                isConnected: false,
                error: "Failed to initiate Facebook connection",
            })
            setIsConnecting(false)
        }
    }, [])

    // Disconnect from Facebook
    const handleDisconnect = useCallback(async () => {
        try {
            // Clear stored connection data
            localStorage.removeItem("facebook_connection")
            localStorage.removeItem("sm_conversations")
            localStorage.removeItem("sm_messages")
            localStorage.removeItem("sm_platform_connections")

            setConnectionStatus({ isConnected: false })
            onConnectionChange?.(false)
        } catch (error) {
            console.error("Error disconnecting:", error)
        }
    }, [onConnectionChange])

    // Check status on mount
    useEffect(() => {
        checkConnectionStatus()
        handleOAuthCallback()
    }, [checkConnectionStatus, handleOAuthCallback])

    return {
        connectionStatus,
        isConnecting,
        includeOptionalPermissions,
        setIncludeOptionalPermissions,
        handleConnect,
        handleDisconnect,
        checkConnectionStatus,
        handleOAuthCallback,
    }
}
