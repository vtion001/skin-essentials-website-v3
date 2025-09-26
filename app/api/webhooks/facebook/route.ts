import { NextRequest, NextResponse } from 'next/server'
import { facebookAPI } from '@/lib/facebook-api'
import { socialMediaService } from '@/lib/admin-services'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    // Verify webhook subscription
    if (mode === 'subscribe' && token === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN) {
      console.log('Facebook webhook verified')
      return new NextResponse(challenge, { status: 200 })
    }

    return new NextResponse('Forbidden', { status: 403 })
  } catch (error) {
    console.error('Facebook webhook verification error:', error)
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
    const isValid = facebookAPI.verifyWebhookSignature(
      JSON.stringify(body),
      signature
    )

    if (!isValid) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    // Process webhook data
    if (body.object === 'page') {
      for (const entry of body.entry) {
        await processPageEntry(entry)
      }
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Facebook webhook processing error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

async function processPageEntry(entry: any) {
  try {
    const pageId = entry.id
    
    // Get the platform connection for this page
    const connections = socialMediaService.getPlatformConnections()
    const connection = connections.find(
      conn => conn.platform === 'facebook' && conn.pageId === pageId
    )

    if (!connection) {
      console.log(`No connection found for Facebook page ${pageId}`)
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
    console.error('Error processing page entry:', error)
  }
}

async function processMessagingEvent(event: any, connection: any, pageId: string) {
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
            participantName: senderInfo.name || 'Unknown User',
            participantProfilePicture: senderInfo.profile_pic || '',
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
          senderName: senderInfo.name || 'Unknown User',
          senderProfilePicture: senderInfo.profile_pic || '',
          message: message.text || '',
          timestamp: new Date(timestamp).toISOString(),
          isRead: false,
          isReplied: false,
          replyMessage: '',
          replyTimestamp: '',
          attachments: message.attachments?.map((att: any) => att.payload?.url || '') || [],
          clientId: senderId,
          conversationId: `fb_${senderId}`,
          messageType: messageType,
          isFromPage: false
        }

        // Add message to conversation using the new public method
        socialMediaService.addMessageToConversation(`fb_${senderId}`, newMessage)

        console.log(`New Facebook message received from ${senderInfo.name}`)
      }
    }

    // Handle delivery confirmations
    if (delivery) {
      console.log('Facebook message delivery confirmed')
    }

    // Handle read receipts
    if (read) {
      console.log('Facebook message read receipt received')
    }

  } catch (error) {
    console.error('Error processing messaging event:', error)
  }
}

async function processChange(change: any, connection: any, pageId: string) {
  try {
    // Handle different types of changes
    console.log('Facebook page change received:', change.field)
    
    // You can add specific handling for different change types here
    // For example: feed updates, page info changes, etc.
    
  } catch (error) {
    console.error('Error processing change:', error)
  }
}