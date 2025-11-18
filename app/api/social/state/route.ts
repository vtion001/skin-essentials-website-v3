import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdminClient } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const supabase = supabaseAdminClient()
    const { data: connections } = await supabase
      .from('social_connections')
      .select('id, platform, page_id, page_name, is_connected, last_sync_timestamp, webhook_verified')
      .order('page_name', { ascending: true })
    const { data: conversations } = await supabase
      .from('social_conversations')
      .select('id, platform, participant_id, participant_name, participant_profile_picture, last_message, last_message_timestamp, unread_count, is_active, page_id, page_name, client_id')
      .order('last_message_timestamp', { ascending: false })
    const { data: messages } = await supabase
      .from('social_messages')
      .select('id, platform, sender_id, sender_name, sender_profile_picture, message, timestamp, is_read, is_replied, reply_message, reply_timestamp, attachments, client_id, conversation_id, message_type, is_from_page')
      .order('timestamp', { ascending: false })
    return NextResponse.json({
      connections: (connections || []).map((c: any) => ({
        id: c.id,
        platform: c.platform,
        pageId: c.page_id,
        pageName: c.page_name,
        isConnected: c.is_connected,
        lastSyncTimestamp: c.last_sync_timestamp,
        webhookVerified: c.webhook_verified,
      })),
      conversations: conversations || [],
      messages: messages || [],
    })
  } catch (err: any) {
    return NextResponse.json({ messages: [], conversations: [], connections: [] }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = supabaseAdminClient()
    const body = await req.json()
    const messages = Array.isArray(body?.messages) ? body.messages : []
    const conversations = Array.isArray(body?.conversations) ? body.conversations : []
    const connections = Array.isArray(body?.connections) ? body.connections : []
    const sanitizedConnections = connections.map((c: any) => ({
      id: c.id,
      platform: c.platform,
      page_id: c.pageId,
      page_name: c.pageName,
      is_connected: !!c.isConnected,
      last_sync_timestamp: c.lastSyncTimestamp,
      webhook_verified: !!c.webhookVerified,
    }))
    if (sanitizedConnections.length) {
      await supabase.from('social_connections').upsert(sanitizedConnections, { onConflict: 'id' })
    }
    if (conversations.length) {
      await supabase.from('social_conversations').upsert(conversations, { onConflict: 'id' })
    }
    if (messages.length) {
      await supabase.from('social_messages').upsert(messages, { onConflict: 'id' })
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to save' }, { status: 500 })
  }
}