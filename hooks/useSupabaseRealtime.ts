/**
 * useSupabaseRealtime Hook
 * Subscribes to real-time updates from Supabase
 * Used by SocialConversationUI to get instant message updates
 */

'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import type { DBMessage, DBConversation } from '@/lib/services/admin/supabase-social.service'

interface UseSupabaseRealtimeOptions {
    pageIds: string[]
    onNewMessage?: (message: DBMessage) => void
    onConversationUpdate?: (conversation: DBConversation) => void
    enabled?: boolean
}

export function useSupabaseRealtime({
    pageIds,
    onNewMessage,
    onConversationUpdate,
    enabled = true
}: UseSupabaseRealtimeOptions) {
    const supabaseRef = useRef<SupabaseClient | null>(null)
    const messagesChannelRef = useRef<RealtimeChannel | null>(null)
    const conversationsChannelRef = useRef<RealtimeChannel | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [lastMessage, setLastMessage] = useState<DBMessage | null>(null)

    // Initialize Supabase client
    const getSupabase = useCallback(() => {
        if (!supabaseRef.current) {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            if (url && key) {
                supabaseRef.current = createClient(url, key)
            }
        }
        return supabaseRef.current
    }, [])

    // Subscribe to messages
    useEffect(() => {
        if (!enabled || pageIds.length === 0) return

        const supabase = getSupabase()
        if (!supabase) {
            console.warn('[useSupabaseRealtime] Supabase not configured')
            return
        }

        // Clean up existing subscription
        if (messagesChannelRef.current) {
            messagesChannelRef.current.unsubscribe()
        }

        console.log('[useSupabaseRealtime] Subscribing to messages for pages:', pageIds)

        // Subscribe to new messages
        messagesChannelRef.current = supabase
            .channel(`messages_${pageIds.join('_')}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'social_messages'
                },
                (payload) => {
                    const newMessage = payload.new as DBMessage
                    console.log('[useSupabaseRealtime] New message:', newMessage)

                    // Only process if it's for one of our pages
                    if (pageIds.includes(newMessage.page_id)) {
                        setLastMessage(newMessage)
                        onNewMessage?.(newMessage)
                    }
                }
            )
            .subscribe((status) => {
                console.log('[useSupabaseRealtime] Messages subscription:', status)
                setIsConnected(status === 'SUBSCRIBED')
            })

        return () => {
            if (messagesChannelRef.current) {
                messagesChannelRef.current.unsubscribe()
                messagesChannelRef.current = null
            }
        }
    }, [enabled, pageIds.join(','), onNewMessage, getSupabase])

    // Subscribe to conversation updates
    useEffect(() => {
        if (!enabled || pageIds.length === 0) return

        const supabase = getSupabase()
        if (!supabase) return

        // Clean up existing subscription
        if (conversationsChannelRef.current) {
            conversationsChannelRef.current.unsubscribe()
        }

        console.log('[useSupabaseRealtime] Subscribing to conversations')

        // Subscribe to conversation changes
        conversationsChannelRef.current = supabase
            .channel(`conversations_${pageIds.join('_')}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'social_conversations'
                },
                (payload) => {
                    const conversation = (payload.new || payload.old) as DBConversation
                    console.log('[useSupabaseRealtime] Conversation update:', payload.eventType, conversation)

                    if (pageIds.includes(conversation.page_id)) {
                        onConversationUpdate?.(conversation)
                    }
                }
            )
            .subscribe((status) => {
                console.log('[useSupabaseRealtime] Conversations subscription:', status)
            })

        return () => {
            if (conversationsChannelRef.current) {
                conversationsChannelRef.current.unsubscribe()
                conversationsChannelRef.current = null
            }
        }
    }, [enabled, pageIds.join(','), onConversationUpdate, getSupabase])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (messagesChannelRef.current) {
                messagesChannelRef.current.unsubscribe()
            }
            if (conversationsChannelRef.current) {
                conversationsChannelRef.current.unsubscribe()
            }
        }
    }, [])

    return {
        isConnected,
        lastMessage
    }
}
