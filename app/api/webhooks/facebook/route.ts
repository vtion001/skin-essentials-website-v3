/**
 * Facebook Webhook Handler
 * Receives real-time updates from Facebook when new messages arrive
 * 
 * Setup: 
 * 1. Go to Facebook Developer Console > Your App > Webhooks
 * 2. Add callback URL: https://your-domain.com/api/webhooks/facebook
 * 3. Add verify token from FACEBOOK_WEBHOOK_VERIFY_TOKEN env var
 * 4. Subscribe to: messages, messaging_postbacks
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseSocialService } from '@/lib/services/admin/supabase-social.service'

// GET: Webhook verification (Facebook sends this to verify your endpoint)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN

  console.log('[Facebook Webhook] Verification request:', { mode, token, challenge })

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Facebook Webhook] Verification successful')
    return new NextResponse(challenge, { status: 200 })
  }

  console.error('[Facebook Webhook] Verification failed')
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// POST: Receive incoming messages and events
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('[Facebook Webhook] Received event:', JSON.stringify(body, null, 2))

    // Validate this is a page event
    if (body.object !== 'page') {
      return NextResponse.json({ error: 'Not a page event' }, { status: 400 })
    }

    // Process each entry
    for (const entry of body.entry || []) {
      const pageId = entry.id
      const time = entry.time

      // Process messaging events
      for (const event of entry.messaging || []) {
        await processMessagingEvent(pageId, event)
      }

      // Process changes (for other webhook subscriptions)
      for (const change of entry.changes || []) {
        await processChange(pageId, change)
      }
    }

    // Always return 200 quickly to Facebook (they have strict timeout)
    return NextResponse.json({ received: true }, { status: 200 })

  } catch (error) {
    console.error('[Facebook Webhook] Error processing:', error)
    // Still return 200 to prevent Facebook from retrying
    return NextResponse.json({ received: true, error: 'Processing error' }, { status: 200 })
  }
}

async function processMessagingEvent(pageId: string, event: any) {
  const senderId = event.sender?.id
  const recipientId = event.recipient?.id
  const timestamp = event.timestamp

  // Determine if this is an incoming or outgoing message
  const isFromPage = senderId === pageId
  const participantId = isFromPage ? recipientId : senderId

  console.log('[Facebook Webhook] Processing message event:', {
    pageId,
    senderId,
    recipientId,
    isFromPage,
    hasMessage: !!event.message
  })

  // Handle incoming message
  if (event.message) {
    const message = event.message
    const messageId = message.mid
    const text = message.text || ''
    const attachments = message.attachments

    // Generate a conversation ID (Facebook uses thread IDs, but for DMs we use participant combo)
    const conversationId = `t_${pageId}_${participantId}`

    // Upsert the conversation first
    await supabaseSocialService.upsertConversation({
      id: conversationId,
      platform: 'facebook',
      page_id: pageId,
      participant_id: participantId,
      participant_name: null, // We'll fetch this separately
      last_message: text || (attachments ? '[Media]' : ''),
      last_message_timestamp: new Date(timestamp).toISOString(),
      unread_count: isFromPage ? 0 : 1,
      is_archived: false
    })

    // Insert the message
    await supabaseSocialService.insertMessage({
      id: messageId,
      conversation_id: conversationId,
      platform: 'facebook',
      page_id: pageId,
      sender_id: senderId,
      sender_name: null,
      message: text,
      message_type: attachments ? 'media' : 'text',
      attachments: attachments || null,
      is_from_page: isFromPage,
      is_read: isFromPage, // Outgoing messages are always "read"
      timestamp: new Date(timestamp).toISOString()
    })

    console.log('[Facebook Webhook] Message saved:', messageId)
  }

  // Handle message read receipts
  if (event.read) {
    console.log('[Facebook Webhook] Read receipt:', event.read)
    // Could update is_read for messages up to this watermark
  }

  // Handle message delivery receipts
  if (event.delivery) {
    console.log('[Facebook Webhook] Delivery receipt:', event.delivery)
  }

  // Handle postbacks (button clicks)
  if (event.postback) {
    console.log('[Facebook Webhook] Postback:', event.postback)
  }
}

async function processChange(pageId: string, change: any) {
  console.log('[Facebook Webhook] Processing change:', {
    pageId,
    field: change.field,
    value: change.value
  })

  // Handle different change types
  switch (change.field) {
    case 'feed':
      // Page feed updates (posts, comments)
      break
    case 'conversations':
      // Conversation updates
      break
    default:
      console.log('[Facebook Webhook] Unhandled change field:', change.field)
  }
}