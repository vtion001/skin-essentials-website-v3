import { NextRequest, NextResponse } from 'next/server'
import { FacebookWebhookEntry, FacebookMessagingEvent, FacebookChange } from '@/lib/types/api.types'
import { SocialMediaConnection } from '@/lib/types/connection.types'
import { facebookAPI } from '@/lib/facebook-api'
import { socialMediaService } from '@/lib/admin-services'
import { logError } from '@/lib/error-logger'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')


    const expectedToken = (process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'SEBH_DEV_VERIFY')
    // Verify webhook subscription
    if (mode === 'subscribe' && (token || '').trim() === expectedToken.trim()) {
      return new NextResponse(challenge, { status: 200 })
    }

    return new NextResponse('Forbidden', { status: 403 })
  } catch (error) {
    await logError('facebook_webhook_get', error as Error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-hub-signature-256')
    console.log('Facebook webhook POST received', {
      object: body?.object,
      entryCount: Array.isArray(body?.entry) ? body.entry.length : 0,
      hasSignature: !!signature
    })

    if (!signature) {
      return new NextResponse('No signature', { status: 400 })
    }

    // Verify webhook signature
    const isValid = facebookAPI.verifyWebhookSignature(
      JSON.stringify(body),
      signature
    )
    console.log('Facebook webhook signature valid:', isValid)

    if (!isValid) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    const __dbg = Array.from({ length: 20 }, (_, i) => i + 1)
    for (const n of __dbg) {
      console.log('FB_POST_DEBUG', n)
    }

    // Process webhook data
    if (body.object === 'page') {
      for (const entry of body.entry) {
        await processPageEntry(entry)
      }
    }

    console.log('Facebook webhook processed successfully')
    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    await logError('facebook_webhook_post', error as Error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

async function processPageEntry(entry: FacebookWebhookEntry) {
  try {
    const pageId = entry.id
    if (typeof entry.time === 'number') {
      const ageMs = Date.now() - entry.time
      if (ageMs > 5 * 60 * 1000) return
    }

    // Get the platform connection for this page
    const connections = socialMediaService.getPlatformConnections()
    const connection = connections.find(
      conn => conn.platform === 'facebook' && conn.pageId === pageId
    )

    if (!connection) {
      return
    }

    // Process messaging events
    if (entry.messaging) {
      for (const messagingEvent of entry.messaging) {
        await processMessagingEvent(messagingEvent, connection, pageId)
      }
    }

    // Process changes (for other types of updates)
    if (entry.changes) {
      for (const change of entry.changes) {
        await processChange(change, connection, pageId)
      }
    }

  } catch (error) {
    await logError('facebook_process_page_entry', error as Error, { entry })
  }
}

async function processMessagingEvent(event: FacebookMessagingEvent, connection: SocialMediaConnection, pageId: string) {
  try {
    const { sender, recipient, timestamp, message, delivery, read } = event

    // Handle new messages
    if (message) {
      const senderId = sender.id
      const recipientId = recipient.id

      // Check if this is a message TO the page (from a user)
      if (recipientId === pageId) {
        // Get sender info
        const senderInfo = await facebookAPI.getUserInfo(senderId, connection.accessToken)

        // Find or create conversation
        let conversation = socialMediaService.getConversationById(`fb_${senderId}`)

        if (!conversation) {
          // Create new conversation
          conversation = {
            id: `fb_${senderId}`,
            platform: 'facebook',
            participantId: senderId,
            participantName: senderInfo.user?.name || 'Unknown User',
            participantProfilePicture: senderInfo.user?.profile_pic || '',
            lastMessage: message.text || 'Media message',
            lastMessageTimestamp: new Date(timestamp).toISOString(),
            unreadCount: 1,
            isActive: true,
            messages: []
          }

          // Add conversation to service
          socialMediaService.addConversation(conversation)
        }

        // Determine message type based on content
        let messageType: 'text' | 'image' | 'video' | 'audio' | 'file' = 'text'
        if (message.attachments && message.attachments.length > 0) {
          const attachment = message.attachments[0]
          if (attachment.type === 'image') messageType = 'image'
          else if (attachment.type === 'video') messageType = 'video'
          else if (attachment.type === 'audio') messageType = 'audio'
          else messageType = 'file'
        }

        // Create message object
        const newMessage = {
          id: `fb_${event.mid || Date.now()}`,
          platform: 'facebook' as const,
          senderId: senderId,
          senderName: senderInfo.user?.name || 'Unknown User',
          senderProfilePicture: senderInfo.user?.profile_pic || '',
          message: message.text || '',
          timestamp: new Date(timestamp).toISOString(),
          isRead: false,
          isReplied: false,
          replyMessage: '',
          replyTimestamp: '',
          attachments: message.attachments?.map((att: { payload?: { url?: string } }) => att.payload?.url || '') || [],
          clientId: senderId,
          conversationId: `fb_${senderId}`,
          messageType: messageType,
          isFromPage: false
        }

        // Add message to conversation using the new public method
        socialMediaService.addMessageToConversation(`fb_${senderId}`, newMessage)

      }
    }

    // Handle delivery confirmations
    if (delivery) {
    }

    // Handle read receipts
    if (read) {
    }

  } catch (error) {
    await logError('facebook_process_messaging_event', error as Error, { event })
  }
}

async function processChange(change: FacebookChange, connection: SocialMediaConnection, pageId: string) {
  try {
    // Handle different types of changes

    // You can add specific handling for different change types here
    // For example: feed updates, page info changes, etc.

  } catch (error) {
    await logError('facebook_process_change', error as Error, { change })
  }
}