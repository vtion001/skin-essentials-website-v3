/**
 * Supabase Social Media Service
 * Handles all database operations for social media conversations and messages
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'

export interface DBConversation {
    id: string
    platform: string
    page_id: string
    participant_id: string | null
    participant_name: string | null
    participant_profile_picture: string | null
    last_message: string | null
    last_message_timestamp: string | null
    unread_count: number
    is_archived: boolean
    created_at: string
    updated_at: string
}

export interface DBMessage {
    id: string
    conversation_id: string
    platform: string
    page_id: string
    sender_id: string | null
    sender_name: string | null
    message: string | null
    message_type: string
    attachments: any
    is_from_page: boolean
    is_read: boolean
    timestamp: string
    created_at: string
}

export interface DBPlatformConnection {
    id: string
    platform: string
    page_id: string
    page_name: string | null
    access_token: string | null
    is_connected: boolean
    last_sync_at: string | null
    webhook_verified: boolean
    created_at: string
    updated_at: string
}

type RealtimeCallback = (payload: { new: DBMessage; old: DBMessage | null }) => void

class SupabaseSocialService {
    private supabase: SupabaseClient | null = null
    private messagesChannel: RealtimeChannel | null = null
    private conversationsChannel: RealtimeChannel | null = null

    private getClient(): SupabaseClient {
        if (!this.supabase) {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            if (!url || !key) {
                throw new Error('Supabase credentials not configured')
            }
            this.supabase = createClient(url, key)
        }
        return this.supabase
    }

    // ============================================
    // PLATFORM CONNECTIONS
    // ============================================

    async getConnections(): Promise<DBPlatformConnection[]> {
        const { data, error } = await this.getClient()
            .from('social_platform_connections')
            .select('*')
            .eq('is_connected', true)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[SupabaseSocial] Error fetching connections:', error)
            return []
        }
        return data || []
    }

    async upsertConnection(connection: Partial<DBPlatformConnection>): Promise<DBPlatformConnection | null> {
        const { data, error } = await this.getClient()
            .from('social_platform_connections')
            .upsert({
                ...connection,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'platform,page_id'
            })
            .select()
            .single()

        if (error) {
            console.error('[SupabaseSocial] Error upserting connection:', error)
            return null
        }
        return data
    }

    async updateLastSync(pageId: string, platform: string): Promise<void> {
        await this.getClient()
            .from('social_platform_connections')
            .update({ last_sync_at: new Date().toISOString() })
            .eq('page_id', pageId)
            .eq('platform', platform)
    }

    // ============================================
    // CONVERSATIONS
    // ============================================

    async getConversations(platform?: string, pageId?: string): Promise<DBConversation[]> {
        let query = this.getClient()
            .from('social_conversations')
            .select('*')
            .eq('is_archived', false)
            .order('last_message_timestamp', { ascending: false })

        if (platform) query = query.eq('platform', platform)
        if (pageId) query = query.eq('page_id', pageId)

        const { data, error } = await query.limit(100)

        if (error) {
            console.error('[SupabaseSocial] Error fetching conversations:', error)
            return []
        }
        return data || []
    }

    async upsertConversation(conversation: Partial<DBConversation>): Promise<DBConversation | null> {
        const { data, error } = await this.getClient()
            .from('social_conversations')
            .upsert({
                ...conversation,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'id'
            })
            .select()
            .single()

        if (error) {
            console.error('[SupabaseSocial] Error upserting conversation:', error)
            return null
        }
        return data
    }

    async markConversationRead(conversationId: string): Promise<void> {
        await this.getClient()
            .from('social_conversations')
            .update({ unread_count: 0, updated_at: new Date().toISOString() })
            .eq('id', conversationId)

        await this.getClient()
            .from('social_messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .eq('is_from_page', false)
    }

    // ============================================
    // MESSAGES
    // ============================================

    async getMessages(conversationId: string, limit = 50): Promise<DBMessage[]> {
        const { data, error } = await this.getClient()
            .from('social_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('timestamp', { ascending: true })
            .limit(limit)

        if (error) {
            console.error('[SupabaseSocial] Error fetching messages:', error)
            return []
        }
        return data || []
    }

    async getMessagesSince(pageId: string, since: string): Promise<DBMessage[]> {
        const { data, error } = await this.getClient()
            .from('social_messages')
            .select('*')
            .eq('page_id', pageId)
            .gt('timestamp', since)
            .order('timestamp', { ascending: true })

        if (error) {
            console.error('[SupabaseSocial] Error fetching messages since:', error)
            return []
        }
        return data || []
    }

    async upsertMessage(message: Partial<DBMessage>): Promise<DBMessage | null> {
        const { data, error } = await this.getClient()
            .from('social_messages')
            .upsert(message, { onConflict: 'id' })
            .select()
            .single()

        if (error) {
            console.error('[SupabaseSocial] Error upserting message:', error)
            return null
        }
        return data
    }

    async insertMessage(message: Omit<DBMessage, 'created_at'>): Promise<DBMessage | null> {
        const { data, error } = await this.getClient()
            .from('social_messages')
            .insert({
                ...message,
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            console.error('[SupabaseSocial] Error inserting message:', error)
            return null
        }
        return data
    }

    // ============================================
    // REALTIME SUBSCRIPTIONS
    // ============================================

    subscribeToMessages(pageIds: string[], callback: RealtimeCallback): void {
        if (this.messagesChannel) {
            this.messagesChannel.unsubscribe()
        }

        // Subscribe to new messages for specific pages
        this.messagesChannel = this.getClient()
            .channel('social_messages_realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'social_messages',
                    filter: pageIds.length === 1
                        ? `page_id=eq.${pageIds[0]}`
                        : undefined
                },
                (payload) => {
                    console.log('[SupabaseSocial] New message received:', payload)
                    callback({ new: payload.new as DBMessage, old: payload.old as DBMessage | null })
                }
            )
            .subscribe((status) => {
                console.log('[SupabaseSocial] Messages subscription status:', status)
            })
    }

    subscribeToConversations(pageIds: string[], callback: (payload: any) => void): void {
        if (this.conversationsChannel) {
            this.conversationsChannel.unsubscribe()
        }

        this.conversationsChannel = this.getClient()
            .channel('social_conversations_realtime')
            .on(
                'postgres_changes',
                {
                    event: '*', // INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'social_conversations'
                },
                (payload) => {
                    console.log('[SupabaseSocial] Conversation change:', payload)
                    callback(payload)
                }
            )
            .subscribe((status) => {
                console.log('[SupabaseSocial] Conversations subscription status:', status)
            })
    }

    unsubscribeAll(): void {
        if (this.messagesChannel) {
            this.messagesChannel.unsubscribe()
            this.messagesChannel = null
        }
        if (this.conversationsChannel) {
            this.conversationsChannel.unsubscribe()
            this.conversationsChannel = null
        }
    }
}

// Export singleton instance
export const supabaseSocialService = new SupabaseSocialService()
