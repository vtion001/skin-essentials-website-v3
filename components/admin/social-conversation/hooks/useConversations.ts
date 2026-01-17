"use client"

import { useState, useCallback, useRef } from "react"
import type { SocialConversation } from "@/lib/social-types"
import type { DBConversation } from "@/lib/services/admin/supabase-social.service"

interface UseConversationsProps {
    socialMediaService: any
    onError?: (error: string) => void
}

interface UseConversationsReturn {
    conversations: SocialConversation[]
    setConversations: React.Dispatch<React.SetStateAction<SocialConversation[]>>
    selectedConversation: SocialConversation | null
    setSelectedConversation: (conv: SocialConversation | null) => void
    loadConversations: () => Promise<void>
    loadConversationsFromSupabase: () => Promise<void>
    loadConversationsLocal: () => void
    isLoading: boolean
    initialLoading: boolean
    setInitialLoading: (loading: boolean) => void
    error: string | null
}

/**
 * Hook for managing conversations data
 * Handles fetching, caching, and state management for conversations
 */
export function useConversations({
    socialMediaService,
    onError,
}: UseConversationsProps): UseConversationsReturn {
    const [conversations, setConversations] = useState<SocialConversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<SocialConversation | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Load conversations from Supabase (fast local read)
    const loadConversationsFromSupabase = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/social/conversations", {
                headers: { "ngrok-skip-browser-warning": "true" },
            })

            if (!res.ok) throw new Error("Failed to fetch conversations")

            const data = await res.json()

            // Convert DB format to UI format
            const uiConversations: SocialConversation[] = (data.conversations || []).map(
                (c: DBConversation) => ({
                    id: c.id,
                    platform: c.platform as "facebook" | "instagram",
                    pageId: c.page_id,
                    participantId: c.participant_id || "",
                    participantName: c.participant_name || "Unknown",
                    participantProfilePicture: c.participant_profile_picture || undefined,
                    lastMessage: c.last_message || "",
                    lastMessageTimestamp: c.last_message_timestamp || new Date().toISOString(),
                    unreadCount: c.unread_count || 0,
                    isArchived: c.is_archived || false,
                })
            )

            setConversations(uiConversations)
            console.log("[Conversations] Supabase conversations loaded:", uiConversations.length)

            if (initialLoading) {
                setTimeout(() => setInitialLoading(false), 300)
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load conversations"
            console.error("[Conversations] Error loading from Supabase:", err)
            setError(message)
            onError?.(message)
            // Fallback to local method
            loadConversationsLocal()
        } finally {
            setIsLoading(false)
        }
    }, [initialLoading, onError])

    // Fallback: Load from localStorage (old method)
    const loadConversationsLocal = useCallback(() => {
        try {
            const allConversations = socialMediaService.getAllConversations()
            setConversations(allConversations)
            console.log("[Conversations] localStorage loaded:", allConversations.length)

            if (initialLoading) {
                setTimeout(() => setInitialLoading(false), 300)
            }
        } catch (err) {
            console.error("[Conversations] Error loading from localStorage:", err)
            setError("Failed to load local conversations")
        }
    }, [socialMediaService, initialLoading])

    // Main load function - uses Supabase by default
    const loadConversations = useCallback(async () => {
        await loadConversationsFromSupabase()
    }, [loadConversationsFromSupabase])

    return {
        conversations,
        setConversations,
        selectedConversation,
        setSelectedConversation,
        loadConversations,
        loadConversationsFromSupabase,
        loadConversationsLocal,
        isLoading,
        initialLoading,
        setInitialLoading,
        error,
    }
}
