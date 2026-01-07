/**
 * Incremental Sync API
 * Fetches only NEW messages since last sync from Facebook
 * Stores everything in Supabase for persistence
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseSocialService } from '@/lib/services/admin/supabase-social.service'
import { facebookAPI } from '@/lib/facebook-api'
import { logAudit } from '@/lib/audit-logger'
import { getAuthUser } from '@/lib/auth-server'

export async function POST(req: NextRequest) {
    const user = await getAuthUser(req)
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { pageId, accessToken, pageName, fullSync = false } = await req.json()

        if (!pageId || !accessToken) {
            return NextResponse.json({ error: 'Missing pageId or accessToken' }, { status: 400 })
        }

        // Get or create connection record
        const connections = await supabaseSocialService.getConnections()
        const existingConnection = connections.find(c => c.page_id === pageId)
        const lastSyncAt = fullSync ? null : existingConnection?.last_sync_at

        console.log(`[Sync] Starting ${lastSyncAt ? 'incremental' : 'full'} sync for page ${pageId}`)

        // Fetch conversations from Facebook (returns any[] for flexibility)
        const fbConversations: any[] = await facebookAPI.getPageConversations(accessToken, pageId) || []

        let newMessagesCount = 0
        let updatedConversations = 0

        for (const conv of fbConversations) {
            // Get update time from various possible fields
            const convUpdatedTime = new Date(conv.updated_time || conv.lastMessageTimestamp || conv.updatedTime || 0)

            // Skip if conversation hasn't been updated since last sync (incremental)
            if (lastSyncAt && convUpdatedTime <= new Date(lastSyncAt)) {
                continue
            }

            // Determine participant info - handle various FB response formats
            const participants = conv.participants?.data || []
            const participant: any = participants.find((p: any) => p.id !== pageId) || {}

            // Upsert conversation to Supabase
            await supabaseSocialService.upsertConversation({
                id: conv.id,
                platform: 'facebook',
                page_id: pageId,
                participant_id: participant.id || conv.participantId || null,
                participant_name: participant.name || conv.participantName || null,
                participant_profile_picture: conv.participantProfilePicture || null,
                last_message: conv.snippet || conv.lastMessage || null,
                last_message_timestamp: conv.updated_time || conv.lastMessageTimestamp || conv.updatedTime || null,
                unread_count: conv.unread_count || 0,
                is_archived: false
            })

            updatedConversations++

            // Fetch messages for this conversation
            const fbMessages: any[] = await facebookAPI.getConversationMessages(accessToken, conv.id) || []

            for (const msg of fbMessages) {
                const msgTimestamp = new Date(msg.created_time || msg.timestamp || msg.createdTime || 0)

                // Skip old messages if doing incremental sync
                if (lastSyncAt && msgTimestamp <= new Date(lastSyncAt)) {
                    continue
                }

                // Determine if message is from the page
                const fromId = msg.from?.id || msg.senderId || msg.sender_id
                const isFromPage = fromId === pageId

                // Upsert message to Supabase
                await supabaseSocialService.upsertMessage({
                    id: msg.id,
                    conversation_id: conv.id,
                    platform: 'facebook',
                    page_id: pageId,
                    sender_id: fromId || null,
                    sender_name: msg.from?.name || msg.senderName || msg.sender_name || null,
                    message: msg.message || msg.text || null,
                    message_type: msg.attachments?.data?.length ? 'media' : 'text',
                    attachments: msg.attachments?.data || null,
                    is_from_page: isFromPage,
                    is_read: isFromPage,
                    timestamp: (msg.created_time || msg.timestamp || msg.createdTime || new Date().toISOString()),
                    created_at: new Date().toISOString()
                })

                newMessagesCount++
            }
        }

        // Update connection with last sync time
        await supabaseSocialService.upsertConnection({
            platform: 'facebook',
            page_id: pageId,
            page_name: pageName || existingConnection?.page_name || null,
            access_token: accessToken, // Consider encrypting this
            is_connected: true,
            last_sync_at: new Date().toISOString(),
            webhook_verified: existingConnection?.webhook_verified || false
        })

        console.log(`[Sync] Completed: ${updatedConversations} conversations, ${newMessagesCount} new messages`)

        await logAudit({
            userId: user.id,
            action: 'READ',
            resource: 'SocialMedia-Sync',
            details: {
                pageId,
                syncType: lastSyncAt ? 'incremental' : 'full',
                newMessages: newMessagesCount,
                updatedConversations
            },
            status: 'SUCCESS'
        })

        return NextResponse.json({
            success: true,
            syncType: lastSyncAt ? 'incremental' : 'full',
            newMessages: newMessagesCount,
            updatedConversations
        })

    } catch (error: any) {
        console.error('[Sync] Error:', error)

        if (user) {
            await logAudit({
                userId: user.id,
                action: 'READ',
                resource: 'SocialMedia-Sync',
                status: 'FAILURE',
                details: { error: error.message }
            })
        }

        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
