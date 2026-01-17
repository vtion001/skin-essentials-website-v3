"use client"

import { useState, useCallback, useRef } from "react"
import type { SocialConversation, SocialMessage } from "@/lib/social-types"
import type { DBMessage } from "@/lib/services/admin/supabase-social.service"

interface UseMessagingProps {
    socialMediaService: any
    onMessageSent?: () => void
    onConversationsRefresh?: () => void
}

interface UseMessagingReturn {
    messages: SocialMessage[]
    setMessages: React.Dispatch<React.SetStateAction<SocialMessage[]>>
    newMessage: string
    setNewMessage: (msg: string) => void
    sendMessage: (conversation: SocialConversation) => Promise<boolean>
    loadMessages: (conversationId: string) => Promise<void>
    loadMessagesFromSupabase: (conversationId: string) => Promise<void>
    loadMessagesLocal: (conversationId: string) => void
    isSending: boolean
    error: string | null
    messagesEndRef: React.RefObject<HTMLDivElement>
    scrollToBottom: () => void
}

/**
 * Hook for managing messaging functionality
 * Handles sending, receiving, and loading messages
 */
export function useMessaging({
    socialMediaService,
    onMessageSent,
    onConversationsRefresh,
}: UseMessagingProps): UseMessagingReturn {
    const [messages, setMessages] = useState<SocialMessage[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [])

    // Load messages from Supabase
    const loadMessagesFromSupabase = useCallback(async (conversationId: string) => {
        try {
            const res = await fetch(`/api/social/conversations/${conversationId}/messages`, {
                headers: { "ngrok-skip-browser-warning": "true" },
            })

            if (!res.ok) throw new Error("Failed to fetch messages")

            const data = await res.json()

            // Convert DB format to UI format
            const uiMessages: SocialMessage[] = (data.messages || []).map((m: DBMessage) => ({
                id: m.id,
                conversationId: m.conversation_id,
                senderId: m.sender_id,
                senderName: m.sender_name || "Unknown",
                content: m.content || "",
                timestamp: m.timestamp,
                isFromPage: m.is_from_page || false,
                attachments: m.attachments || [],
                messageType: m.message_type || "text",
            }))

            setMessages(uiMessages)
            console.log("[Messaging] Supabase messages loaded:", uiMessages.length)

            // Mark conversation as read
            try {
                await fetch(`/api/social/conversations/${conversationId}/read`, {
                    method: "POST",
                    headers: { "ngrok-skip-browser-warning": "true" },
                })
            } catch (readErr) {
                console.error("[Messaging] Error marking as read:", readErr)
            }
        } catch (err) {
            console.error("[Messaging] Error loading from Supabase:", err)
            setError("Failed to load messages")
            // Fallback to local method
            loadMessagesLocal(conversationId)
        }
    }, [])

    // Fallback: Load from localStorage
    const loadMessagesLocal = useCallback(
        (conversationId: string) => {
            try {
                const localMessages = socialMediaService.getMessagesForConversation(conversationId)
                setMessages(localMessages)
                console.log("[Messaging] localStorage loaded:", localMessages.length)
            } catch (err) {
                console.error("[Messaging] Error loading from localStorage:", err)
                setError("Failed to load local messages")
            }
        },
        [socialMediaService]
    )

    // Main load function
    const loadMessages = useCallback(
        async (conversationId: string) => {
            await loadMessagesFromSupabase(conversationId)
        },
        [loadMessagesFromSupabase]
    )

    // Send a message
    const sendMessage = useCallback(
        async (conversation: SocialConversation): Promise<boolean> => {
            if (!newMessage.trim()) return false

            setIsSending(true)
            setError(null)

            try {
                const success = await socialMediaService.sendMessageViaPlatform(
                    conversation.id,
                    newMessage,
                    conversation.platform
                )

                if (success) {
                    setNewMessage("")
                    onMessageSent?.()
                    onConversationsRefresh?.()
                    await loadMessages(conversation.id)
                    return true
                }

                return false
            } catch (err) {
                console.error("[Messaging] Error sending message:", err)
                setError("Failed to send message")
                return false
            } finally {
                setIsSending(false)
            }
        },
        [newMessage, socialMediaService, onMessageSent, onConversationsRefresh, loadMessages]
    )

    return {
        messages,
        setMessages,
        newMessage,
        setNewMessage,
        sendMessage,
        loadMessages,
        loadMessagesFromSupabase,
        loadMessagesLocal,
        isSending,
        error,
        messagesEndRef,
        scrollToBottom,
    }
}
