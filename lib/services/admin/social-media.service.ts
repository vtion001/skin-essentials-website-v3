// Social Media Service
// Extracted from lib/admin-services.ts following SRP

import type {
    SocialMessage,
    SocialConversation,
    SocialPlatformConnection,
    AVATAR_PLACEHOLDER,
} from '@/lib/types/admin.types'
import { facebookAPI } from '@/lib/facebook-api'
import { instagramAPI } from '@/lib/instagram-api'

const AVATAR_PLACEHOLDER_IMG =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="8" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial" font-size="12">IMG</text></svg>'

class SocialMediaService {
    private messages: SocialMessage[] = []
    private conversations: SocialConversation[] = []
    private platformConnections: SocialPlatformConnection[] = []
    private initialized = false

    constructor() {
        if (typeof window !== 'undefined') {
            this.loadFromStorage()
        }
    }

    private loadFromStorage() {
        try {
            const storedMessages = localStorage.getItem('social_messages_data')
            const storedConversations = localStorage.getItem('social_conversations_data')
            const storedConnections = localStorage.getItem('social_connections_data')

            if (storedMessages) {
                this.messages = JSON.parse(storedMessages)
            } else {
                this.messages = this.getDefaultMessages()
            }

            if (storedConversations) {
                this.conversations = JSON.parse(storedConversations)
            } else {
                this.conversations = this.getDefaultConversations()
            }

            if (storedConnections) {
                this.platformConnections = JSON.parse(storedConnections)
            } else {
                this.platformConnections = []
            }

            if (!storedMessages || !storedConversations || !storedConnections) {
                fetch('/api/social/state')
                    .then((res) => res.json())
                    .then((json) => {
                        if (Array.isArray(json.messages)) this.messages = json.messages
                        if (Array.isArray(json.conversations)) this.conversations = json.conversations
                        if (Array.isArray(json.connections)) this.platformConnections = json.connections
                        this.saveToStorage()
                    })
                    .catch(() => this.saveToStorage())
            } else {
                this.saveToStorage()
            }
            this.initialized = true
        } catch (error) {
            console.error('Error loading social media data:', error)
            this.messages = this.getDefaultMessages()
            this.conversations = this.getDefaultConversations()
            this.platformConnections = []
            this.initialized = true
        }
    }

    private saveToStorage() {
        try {
            localStorage.setItem('social_messages_data', JSON.stringify(this.messages))
            localStorage.setItem('social_conversations_data', JSON.stringify(this.conversations))
            localStorage.setItem('social_connections_data', JSON.stringify(this.platformConnections))
            const sanitizedConnections = this.platformConnections.map((c) => ({
                id: c.id,
                platform: c.platform,
                pageId: c.pageId,
                pageName: c.pageName,
                isConnected: c.isConnected,
                lastSyncTimestamp: c.lastSyncTimestamp,
                webhookVerified: c.webhookVerified,
            }))
            fetch('/api/social/state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: this.messages,
                    conversations: this.conversations,
                    connections: sanitizedConnections,
                }),
            }).catch(() => { })
        } catch (error) {
            console.error('Error saving social media data:', error)
        }
    }

    private getDefaultMessages(): SocialMessage[] {
        return [
            {
                id: '1',
                platform: 'instagram',
                senderId: 'user123',
                senderName: 'Emma Wilson',
                senderProfilePicture: AVATAR_PLACEHOLDER_IMG,
                message: "Hi! I'm interested in your dermal filler services. Can you provide more information?",
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                isRead: false,
                isReplied: false,
                attachments: [],
                conversationId: 'conv_1',
                messageType: 'text',
                isFromPage: false,
            },
            {
                id: '2',
                platform: 'facebook',
                senderId: 'user456',
                senderName: 'Jessica Brown',
                senderProfilePicture: AVATAR_PLACEHOLDER_IMG,
                message: 'What are your available time slots for next week?',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                isRead: true,
                isReplied: true,
                replyMessage:
                    'Hi Jessica! We have availability on Tuesday and Thursday. Would you like to schedule a consultation?',
                replyTimestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                attachments: [],
                conversationId: 'conv_2',
                messageType: 'text',
                isFromPage: false,
            },
        ]
    }

    private getDefaultConversations(): SocialConversation[] {
        return [
            {
                id: 'conv_1',
                platform: 'instagram',
                participantId: 'user123',
                participantName: 'Emma Wilson',
                participantProfilePicture: AVATAR_PLACEHOLDER_IMG,
                lastMessage: "Hi! I'm interested in your dermal filler services. Can you provide more information?",
                lastMessageTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                unreadCount: 1,
                isActive: true,
                messages: [],
            },
            {
                id: 'conv_2',
                platform: 'facebook',
                participantId: 'user456',
                participantName: 'Jessica Brown',
                participantProfilePicture: AVATAR_PLACEHOLDER_IMG,
                lastMessage: 'What are your available time slots for next week?',
                lastMessageTimestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                unreadCount: 0,
                isActive: true,
                messages: [],
            },
        ]
    }

    getAllMessages(): SocialMessage[] {
        if (!this.initialized) this.loadFromStorage()
        return [...this.messages]
    }

    getUnreadMessages(): SocialMessage[] {
        return this.messages.filter((msg) => !msg.isRead)
    }

    markAsRead(id: string): boolean {
        const index = this.messages.findIndex((msg) => msg.id === id)
        if (index === -1) return false

        this.messages[index].isRead = true
        this.saveToStorage()
        return true
    }

    replyToMessage(id: string, reply: string): boolean {
        const index = this.messages.findIndex((msg) => msg.id === id)
        if (index === -1) return false

        this.messages[index].isReplied = true
        this.messages[index].replyMessage = reply
        this.messages[index].replyTimestamp = new Date().toISOString()
        this.saveToStorage()
        return true
    }

    // Conversation Management Methods
    getAllConversations(): SocialConversation[] {
        if (!this.initialized) this.loadFromStorage()
        return this.conversations.sort(
            (a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()
        )
    }

    getConversationsByPlatform(platform: 'facebook' | 'instagram'): SocialConversation[] {
        return this.getAllConversations().filter((conv) => conv.platform === platform)
    }

    getConversationById(conversationId: string): SocialConversation | undefined {
        if (!this.initialized) this.loadFromStorage()
        return this.conversations.find((conv) => conv.id === conversationId)
    }

    getMessagesByConversation(conversationId: string): SocialMessage[] {
        if (!this.initialized) this.loadFromStorage()
        return this.messages
            .filter((msg) => msg.conversationId === conversationId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    }

    sendMessageToConversation(conversationId: string, message: string): boolean {
        if (!this.initialized) this.loadFromStorage()

        const conversation = this.conversations.find((conv) => conv.id === conversationId)
        if (!conversation) return false

        const newMessage: SocialMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            platform: conversation.platform,
            senderId: 'page',
            senderName: 'Skin Essentials by HER',
            senderProfilePicture: '/logo.png',
            message,
            timestamp: new Date().toISOString(),
            isRead: true,
            isReplied: false,
            attachments: [],
            conversationId,
            messageType: 'text',
            isFromPage: true,
        }

        this.messages.push(newMessage)

        // Update conversation last message
        conversation.lastMessage = message
        conversation.lastMessageTimestamp = newMessage.timestamp

        this.saveToStorage()
        return true
    }

    markConversationAsRead(conversationId: string): boolean {
        if (!this.initialized) this.loadFromStorage()

        const conversation = this.conversations.find((conv) => conv.id === conversationId)
        if (conversation) {
            conversation.unreadCount = 0

            // Mark all messages in conversation as read
            this.messages
                .filter((msg) => msg.conversationId === conversationId && !msg.isFromPage)
                .forEach((msg) => (msg.isRead = true))

            this.saveToStorage()
            return true
        }
        return false
    }

    // Platform Connection Methods
    getPlatformConnections(): SocialPlatformConnection[] {
        if (!this.initialized) this.loadFromStorage()
        return this.platformConnections
    }

    addPlatformConnection(connection: Omit<SocialPlatformConnection, 'id'>): boolean {
        if (!this.initialized) this.loadFromStorage()

        const newConnection: SocialPlatformConnection = {
            ...connection,
            id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }

        this.platformConnections.push(newConnection)
        this.saveToStorage()
        return true
    }

    updatePlatformConnectionTokenByPageId(pageId: string, newToken: string): boolean {
        if (!this.initialized) this.loadFromStorage()
        const conn = this.platformConnections.find((c) => c.pageId === pageId)
        if (conn) {
            conn.accessToken = newToken
            conn.isConnected = true
            conn.lastSyncTimestamp = new Date().toISOString()
            this.saveToStorage()
            return true
        }
        return false
    }

    removePlatformConnection(connectionId: string): boolean {
        if (!this.initialized) this.loadFromStorage()

        const index = this.platformConnections.findIndex((conn) => conn.id === connectionId)
        if (index !== -1) {
            this.platformConnections.splice(index, 1)
            this.saveToStorage()
            return true
        }
        return false
    }

    updateConnectionStatus(connectionId: string, isConnected: boolean): boolean {
        if (!this.initialized) this.loadFromStorage()

        const connection = this.platformConnections.find((conn) => conn.id === connectionId)
        if (connection) {
            connection.isConnected = isConnected
            this.saveToStorage()
            return true
        }
        return false
    }

    // API Integration Methods
    async syncMessagesFromPlatform(platform: 'facebook' | 'instagram'): Promise<boolean> {
        try {
            if (!this.initialized) this.loadFromStorage()

            const connections = this.platformConnections.filter(
                (conn) => conn.platform === platform && conn.isConnected
            )

            if (connections.length === 0) {
                console.log(`No connected ${platform} accounts found`)
                return false
            }

            for (const connection of connections) {
                if (platform === 'facebook') {
                    await this.syncFacebookMessages(connection)
                } else if (platform === 'instagram') {
                    await this.syncInstagramMessages(connection)
                }
            }

            this.saveToStorage()
            return true
        } catch (error) {
            console.error(`Error syncing ${platform} messages:`, error)
            return false
        }
    }

    private async refreshFacebookTokenIfNeeded(connection: SocialPlatformConnection): Promise<boolean> {
        try {
            const tokenValidation = await facebookAPI.validateAccessToken(connection.accessToken)
            if (tokenValidation.isValid) return true

            const stored = typeof window !== 'undefined' ? localStorage.getItem('facebook_connection') : null
            const userToken = stored ? JSON.parse(stored).accessToken || '' : ''
            if (userToken) {
                const pageTokenRes = await facebookAPI.getPageAccessToken(userToken, connection.pageId)
                if (pageTokenRes.accessToken) {
                    connection.accessToken = pageTokenRes.accessToken
                    connection.isConnected = true
                    return true
                }
            }

            if (tokenValidation.error?.includes('expired')) {
                const refreshResult = await facebookAPI.refreshLongLivedToken(connection.accessToken)
                if (refreshResult.accessToken) {
                    connection.accessToken = refreshResult.accessToken
                    return true
                }
            }

            connection.isConnected = false
            return false
        } catch {
            connection.isConnected = false
            return false
        }
    }

    private async syncFacebookMessages(connection: SocialPlatformConnection): Promise<void> {
        try {
            console.log(`Starting Facebook message sync for page: ${connection.pageName} (${connection.pageId})`)

            // Validate and refresh token if needed
            const tokenIsValid = await this.refreshFacebookTokenIfNeeded(connection)
            if (!tokenIsValid) {
                throw new Error(
                    `Invalid Facebook access token for page ${connection.pageName}. Please reconnect the page.`
                )
            }

            console.log(`Token validation successful for page: ${connection.pageName}`)

            const conversations = await facebookAPI.getPageConversations(connection.accessToken, connection.pageId)
            console.log(`Retrieved ${conversations.length} conversations for page: ${connection.pageName}`)

            for (const fbConversation of conversations) {
                // Convert Facebook conversation to our format
                const existingConversation = this.conversations.find(
                    (c) => c.id === fbConversation.id && c.platform === 'facebook'
                )

                if (!existingConversation) {
                    // Create new conversation
                    const participant =
                        fbConversation.participants.data.find((p: any) => p.id !== connection.pageId) ||
                        fbConversation.participants.data[0]
                    const newConversation: SocialConversation = {
                        id: fbConversation.id,
                        platform: 'facebook',
                        participantId: participant?.id || '',
                        participantName: participant?.name || 'Unknown',
                        participantProfilePicture: undefined,
                        lastMessage: '',
                        lastMessageTimestamp: fbConversation.updated_time,
                        unreadCount: fbConversation.unread_count || 0,
                        isActive: fbConversation.can_reply,
                        messages: [],
                        pageId: connection.pageId,
                        pageName: connection.pageName,
                    }
                    if (newConversation.participantId) {
                        const ui = await facebookAPI.getUserInfo(newConversation.participantId, connection.accessToken)
                        newConversation.participantProfilePicture = ui.user?.picture?.data?.url
                    }
                    this.conversations.push(newConversation)
                    console.log(
                        `Created new conversation: ${fbConversation.id} with ${newConversation.participantName}`
                    )
                }

                try {
                    // Fetch messages for this conversation
                    const fbMessages = await facebookAPI.getConversationMessages(
                        connection.accessToken,
                        fbConversation.id
                    )
                    console.log(`Retrieved ${fbMessages.length} messages for conversation: ${fbConversation.id}`)

                    for (const fbMessage of fbMessages) {
                        const existingMessage = this.messages.find((m) => m.id === fbMessage.id)

                        if (!existingMessage) {
                            const newMessage: SocialMessage = {
                                id: fbMessage.id,
                                platform: 'facebook',
                                senderId: fbMessage.from.id,
                                senderName: fbMessage.from.name,
                                senderProfilePicture: undefined,
                                message: fbMessage.message || '',
                                timestamp: fbMessage.created_time,
                                isRead: false,
                                isReplied: false,
                                attachments: fbMessage.attachments?.data.map((att: any) => att.file_url) || [],
                                conversationId: fbConversation.id,
                                messageType: fbMessage.attachments?.data.length ? 'image' : 'text',
                                isFromPage: fbMessage.from.id === connection.pageId,
                            }
                            if (newMessage.senderId) {
                                const uiMsg = await facebookAPI.getUserInfo(newMessage.senderId, connection.accessToken)
                                newMessage.senderProfilePicture = uiMsg.user?.picture?.data?.url
                            }
                            this.messages.push(newMessage)
                        }
                    }
                    const c = this.conversations.find(
                        (c) => c.id === fbConversation.id && c.platform === 'facebook'
                    )
                    if (c) {
                        const msgs = this.messages
                            .filter((m) => m.conversationId === fbConversation.id)
                            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                        const last = msgs[msgs.length - 1]
                        if (last) {
                            c.lastMessage = last.message || (last.attachments.length ? 'Media message' : '')
                            c.lastMessageTimestamp = last.timestamp
                        }
                    }
                } catch (messageError) {
                    console.error(`Error fetching messages for conversation ${fbConversation.id}:`, messageError)
                    // Continue with other conversations even if one fails
                }
            }

            // Update last sync timestamp
            connection.lastSyncTimestamp = new Date().toISOString()
            console.log(`Facebook message sync completed successfully for page: ${connection.pageName}`)
        } catch (error) {
            console.error(`Error syncing Facebook messages for page ${connection.pageName}:`, {
                error: error instanceof Error ? error.message : 'Unknown error',
                pageId: connection.pageId,
                pageName: connection.pageName,
                timestamp: new Date().toISOString(),
            })
            throw error
        }
    }

    private async syncInstagramMessages(connection: SocialPlatformConnection): Promise<void> {
        try {
            // Get Instagram Business Account ID
            const igAccount = await instagramAPI.getInstagramBusinessAccount(
                connection.accessToken,
                connection.pageId
            )

            if (!igAccount) {
                console.log('No Instagram Business Account found for this page')
                return
            }

            const conversations = await instagramAPI.getConversations(connection.accessToken, igAccount.id)

            for (const igConversation of conversations) {
                // Convert Instagram conversation to our format
                const existingConversation = this.conversations.find(
                    (c) => c.id === igConversation.id && c.platform === 'instagram'
                )

                if (!existingConversation) {
                    const newConversation: SocialConversation = {
                        id: igConversation.id,
                        platform: 'instagram',
                        participantId: igConversation.participants[0]?.id || '',
                        participantName: igConversation.participants[0]?.username || 'Unknown',
                        participantProfilePicture: igConversation.participants[0]?.profile_picture_url,
                        lastMessage: '',
                        lastMessageTimestamp: igConversation.updated_time,
                        unreadCount: igConversation.unread_count || 0,
                        isActive: true,
                        messages: [],
                        pageId: connection.pageId,
                        pageName: connection.pageName,
                    }
                    this.conversations.push(newConversation)
                }

                // Fetch messages for this conversation
                const igMessages = await instagramAPI.getConversationMessages(
                    connection.accessToken,
                    igConversation.id
                )

                for (const igMessage of igMessages) {
                    const existingMessage = this.messages.find((m) => m.id === igMessage.id)

                    if (!existingMessage) {
                        const newMessage: SocialMessage = {
                            id: igMessage.id,
                            platform: 'instagram',
                            senderId: igMessage.from.id,
                            senderName: igMessage.from.username,
                            senderProfilePicture: igMessage.from.profile_picture_url,
                            message: igMessage.text || '',
                            timestamp: igMessage.created_time,
                            isRead: false,
                            isReplied: false,
                            attachments: igMessage.attachments?.map((att: any) => att.url) || [],
                            conversationId: igConversation.id,
                            messageType: igMessage.attachments?.length ? 'image' : 'text',
                            isFromPage: igMessage.from.id === igAccount.id,
                        }
                        this.messages.push(newMessage)
                    }
                }
                const c = this.conversations.find(
                    (c) => c.id === igConversation.id && c.platform === 'instagram'
                )
                if (c) {
                    const msgs = this.messages
                        .filter((m) => m.conversationId === igConversation.id)
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                    const last = msgs[msgs.length - 1]
                    if (last) {
                        c.lastMessage = last.message || (last.attachments.length ? 'Media message' : '')
                        c.lastMessageTimestamp = last.timestamp
                    }
                }
            }

            // Update last sync timestamp
            connection.lastSyncTimestamp = new Date().toISOString()
        } catch (error) {
            console.error('Error syncing Instagram messages:', error)
            throw error
        }
    }

    /**
     * Public method to save data to storage (for webhook handlers)
     */
    public saveData(): void {
        this.saveToStorage()
    }

    /**
     * Public method to add a conversation (for webhook handlers)
     */
    public addConversation(conversation: SocialConversation): void {
        this.conversations.push(conversation)
        this.saveToStorage()
    }

    /**
     * Public method to add a message to a conversation (for webhook handlers)
     */
    public addMessageToConversation(conversationId: string, message: SocialMessage): void {
        const conversation = this.conversations.find((c) => c.id === conversationId)
        if (conversation) {
            conversation.messages.push(message)
            conversation.lastMessage = message.message || 'Media message'
            conversation.lastMessageTimestamp = message.timestamp
            if (!message.isFromPage) {
                conversation.unreadCount += 1
            }
            this.saveToStorage()
        }
    }

    async sendMessageViaPlatform(
        conversationId: string,
        message: string,
        platform: 'facebook' | 'instagram'
    ): Promise<boolean> {
        try {
            if (!this.initialized) this.loadFromStorage()

            const conversation = this.conversations.find((c) => c.id === conversationId)
            if (!conversation) {
                console.error('Conversation not found')
                return false
            }

            const connection = this.platformConnections.find(
                (c) => c.platform === platform && c.pageId === conversation.pageId && c.isConnected
            )

            if (!connection) {
                console.error(`No connected ${platform} account found for this conversation`)
                return false
            }

            let result
            if (platform === 'facebook') {
                result = await facebookAPI.sendMessage(connection.accessToken, conversation.participantId, message)
            } else if (platform === 'instagram') {
                result = await instagramAPI.sendMessage(connection.accessToken, conversation.participantId, message)
            } else {
                return false
            }

            if (result?.message_id) {
                // Add the sent message to our local storage
                const sentMessage: SocialMessage = {
                    id: result.message_id,
                    platform: platform,
                    senderId: connection.pageId,
                    senderName: connection.pageName,
                    message: message,
                    timestamp: new Date().toISOString(),
                    isRead: true,
                    isReplied: false,
                    attachments: [],
                    conversationId: conversationId,
                    messageType: 'text',
                    isFromPage: true,
                }

                this.messages.push(sentMessage)

                // Update conversation
                const conv = this.conversations.find((c) => c.id === conversationId)
                if (conv) {
                    conv.lastMessage = message
                    conv.lastMessageTimestamp = sentMessage.timestamp
                    conv.messages.push(sentMessage)
                }

                this.saveToStorage()
                return true
            }

            return false
        } catch (error) {
            console.error(`Error sending message via ${platform}:`, error)
            return false
        }
    }

    async sendMediaLinkViaPlatform(
        conversationId: string,
        mediaUrl: string,
        platform: 'facebook' | 'instagram'
    ): Promise<boolean> {
        try {
            if (!this.initialized) this.loadFromStorage()

            const conversation = this.conversations.find((c) => c.id === conversationId)
            if (!conversation) {
                console.error('Conversation not found')
                return false
            }

            const connection = this.platformConnections.find(
                (c) => c.platform === platform && c.pageId === conversation.pageId && c.isConnected
            )

            if (!connection) {
                console.error(`No connected ${platform} account found for this conversation`)
                return false
            }

            let result
            if (platform === 'facebook') {
                result = await facebookAPI.sendMessage(connection.accessToken, conversation.participantId, mediaUrl)
            } else if (platform === 'instagram') {
                result = await instagramAPI.sendMessage(connection.accessToken, conversation.participantId, mediaUrl)
            } else {
                return false
            }

            if (result?.message_id) {
                const sentMessage: SocialMessage = {
                    id: result.message_id,
                    platform: platform,
                    senderId: connection.pageId,
                    senderName: connection.pageName,
                    message: mediaUrl,
                    timestamp: new Date().toISOString(),
                    isRead: true,
                    isReplied: false,
                    attachments: [mediaUrl],
                    conversationId: conversationId,
                    messageType: 'image',
                    isFromPage: true,
                }

                this.messages.push(sentMessage)

                const conv = this.conversations.find((c) => c.id === conversationId)
                if (conv) {
                    conv.lastMessage = ''
                    conv.lastMessageTimestamp = sentMessage.timestamp
                    conv.messages.push(sentMessage)
                }

                this.saveToStorage()
                return true
            }

            return false
        } catch (error) {
            console.error(`Error sending media via ${platform}:`, error)
            return false
        }
    }

    setConversationClient(conversationId: string, clientId: string): boolean {
        if (!this.initialized) this.loadFromStorage()
        const conv = this.conversations.find((c) => c.id === conversationId)
        if (!conv) return false
        conv.clientId = clientId
        this.messages
            .filter((m) => m.conversationId === conversationId)
            .forEach((m) => (m.clientId = clientId))
        this.saveToStorage()
        return true
    }

    createPotentialClientDraft(conversationId: string): void {
        if (!this.initialized) this.loadFromStorage()
        const conv = this.conversations.find((c) => c.id === conversationId)
        if (!conv) return
        const messages = this.getMessagesByConversation(conversationId)
        const text = messages.map((m) => m.message).join(' ')
        const emailMatch = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)
        const phoneMatch = text.match(/\+?\d[\d\s-]{6,}/)
        const [firstName, ...rest] = conv.participantName.split(' ')
        const lastName = rest.join(' ')
        const draft = {
            firstName: firstName || '',
            lastName: lastName || '',
            email: emailMatch ? emailMatch[0] : '',
            phone: phoneMatch ? phoneMatch[0].replace(/\s+/g, '') : '',
            address: '',
            status: 'active',
        }
        try {
            localStorage.setItem('potential_client_draft', JSON.stringify(draft))
            localStorage.setItem('potential_conversation_id', conversationId)
        } catch { }
    }
}

export const socialMediaService = new SocialMediaService()
