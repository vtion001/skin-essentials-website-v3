import { NextRequest, NextResponse } from 'next/server'
import { InstagramWebhookEntry, InstagramMessagingEvent, InstagramChange } from '@/lib/types/api.types'
import { SocialMediaConnection } from '@/lib/types/connection.types'
import { instagramAPI } from '@/lib/instagram-api'
import { socialMediaService } from '@/lib/admin-services'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    // Verify webhook subscription
    if (mode === 'subscribe' && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
      console.log('Instagram webhook verified')
      return new NextResponse(challenge, { status: 200 })
    }

    return new NextResponse('Forbidden', { status: 403 })
  } catch (error) {
    console.error('Instagram webhook verification error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-hub-signature-256')

    if (!signature) {
      return new NextResponse('No signature', { status: 400 })
    }

    // Verify webhook signature
    const isValid = instagramAPI.verifyWebhookSignature(
      JSON.stringify(body),
      signature
    )

    if (!isValid) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    // Process webhook data
    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        await processInstagramEntry(entry)
      }
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Instagram webhook processing error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

async function processInstagramEntry(entry: InstagramWebhookEntry) {
  try {
    const instagramAccountId = entry.id

    // Get the platform connection for this Instagram account
    const connections = socialMediaService.getPlatformConnections()
    const connection = connections.find(
      conn => conn.platform === 'instagram' &&
        (conn.pageId === instagramAccountId || conn.pageId.includes(instagramAccountId))
    )

    if (!connection) {
      console.log(`No connection found for Instagram account ${instagramAccountId}`)
      return
    }

    // Process messaging events
    if (entry.messaging) {
      for (const messagingEvent of entry.messaging) {
        await processInstagramMessagingEvent(messagingEvent, connection, instagramAccountId)
      }
    }

    // Process changes (for other types of updates)
    if (entry.changes) {
      for (const change of entry.changes) {
        await processInstagramChange(change, connection, instagramAccountId)
      }
    }

  } catch (error) {
    console.error('Error processing Instagram entry:', error)
  }
}

async function processInstagramMessagingEvent(event: InstagramMessagingEvent, connection: SocialMediaConnection, instagramAccountId: string) {
  try {
    const { sender, recipient, timestamp, message } = event

    // Handle new messages
    if (message) {
      const senderId = sender.id
      const recipientId = recipient.id

      // Check if this is a message TO the Instagram account (from a user)
      if (recipientId === instagramAccountId) {
        // For Instagram, we might need to get user info differently
        // Instagram Basic Display API has limited user info access
        const senderName = `Instagram User ${senderId.slice(-4)}`

        // Find or create conversation
        let conversation = socialMediaService.getConversationById(`ig_${senderId}`)

        if (!conversation) {
          // Create new conversation
          conversation = {
            id: `ig_${senderId}`,
            platform: 'instagram',
            participantId: senderId,
            participantName: senderName,
            participantProfilePicture: '',
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
          id: `ig_${event.mid || Date.now()}`,
          platform: 'instagram' as const,
          senderId: senderId,
          senderName: senderName,
          senderProfilePicture: '',
          message: message.text || '',
          timestamp: new Date(timestamp).toISOString(),
          isRead: false,
          isReplied: false,
          replyMessage: '',
          replyTimestamp: '',
          attachments: message.attachments?.map((att: { payload?: { url?: string } }) => att.payload?.url || '') || [],
          clientId: senderId,
          conversationId: `ig_${senderId}`,
          messageType: messageType,
          isFromPage: false
        }

        // Add message to conversation using the new public method
        socialMediaService.addMessageToConversation(`ig_${senderId}`, newMessage)

        console.log(`New Instagram message received from ${senderName}`)
      }
    }

  } catch (error) {
    console.error('Error processing Instagram messaging event:', error)
  }
}

async function processInstagramChange(change: InstagramChange, connection: SocialMediaConnection, instagramAccountId: string) {
  try {
    // Handle different types of changes
    console.log('Instagram change received:', change.field)

    // You can add specific handling for different change types here
    // For example: media updates, story updates, etc.

  } catch (error) {
    console.error('Error processing Instagram change:', error)
  }
}