/**
 * Social Conversation Types
 * Type definitions for the social messaging module
 */

// Re-export from existing types
export type { SocialConversation, SocialMessage, SocialPlatformConnection } from "@/lib/social-types"
export type { DBMessage, DBConversation } from "@/lib/services/admin/supabase-social.service"

// ================================
// UI State Types
// ================================

export type ConversationTabFilter = "all" | "facebook" | "instagram"

export interface ConversationUIState {
    conversations: SocialConversation[]
    selectedConversation: SocialConversation | null
    messages: SocialMessage[]
    newMessage: string
    platformConnections: SocialPlatformConnection[]
    activeTab: ConversationTabFilter
    searchQuery: string
    isLoading: boolean
    initialLoading: boolean
    showDetails: boolean
    brokenAvatars: Record<string, boolean>
}

// ================================
// Import types for reference
// ================================

import type { SocialConversation, SocialMessage, SocialPlatformConnection } from "@/lib/social-types"

// ================================
// Hook Return Types
// ================================

export interface UseConversationsReturn {
    conversations: SocialConversation[]
    selectedConversation: SocialConversation | null
    setSelectedConversation: (conv: SocialConversation | null) => void
    loadConversations: () => Promise<void>
    isLoading: boolean
    error: string | null
}

export interface UseMessagingReturn {
    messages: SocialMessage[]
    newMessage: string
    setNewMessage: (msg: string) => void
    sendMessage: () => Promise<void>
    loadMessages: (conversationId: string) => Promise<void>
    isSending: boolean
    error: string | null
}

export interface UseRealtimeSyncReturn {
    isConnected: boolean
    triggerSync: () => Promise<void>
    lastSyncTime: string | null
}

// ================================
// Utility Types
// ================================

export interface ConversationSelectHandler {
    (conversation: SocialConversation): void
}

export interface RefreshHandler {
    (): Promise<void>
}
