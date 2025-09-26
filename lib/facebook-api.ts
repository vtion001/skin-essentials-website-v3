/**
 * Facebook Graph API Integration Service
 * Handles authentication, message fetching, and sending for Facebook Pages
 */

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  tasks?: string[];
}

export interface FacebookConversation {
  id: string;
  participants: {
    data: Array<{
      id: string;
      name: string;
      email?: string;
    }>;
  };
  updated_time: string;
  message_count: number;
  unread_count: number;
  can_reply: boolean;
}

export interface FacebookMessage {
  id: string;
  created_time: string;
  from: {
    id: string;
    name: string;
    email?: string;
  };
  to: {
    data: Array<{
      id: string;
      name: string;
    }>;
  };
  message: string;
  attachments?: {
    data: Array<{
      id: string;
      mime_type: string;
      name: string;
      size: number;
      file_url: string;
      image_data?: {
        url: string;
        width: number;
        height: number;
      };
    }>;
  };
}

export interface FacebookWebhookEntry {
  id: string;
  time: number;
  messaging?: Array<{
    sender: { id: string };
    recipient: { id: string };
    timestamp: number;
    message?: {
      mid: string;
      text: string;
      attachments?: Array<{
        type: string;
        payload: {
          url: string;
        };
      }>;
    };
    delivery?: {
      mids: string[];
      watermark: number;
    };
    read?: {
      watermark: number;
    };
  }>;
}

class FacebookAPIService {
  private readonly baseUrl = 'https://graph.facebook.com/v18.0';
  private readonly appId: string;
  private readonly appSecret: string;

  constructor() {
    // In production, these should come from environment variables
    this.appId = process.env.FACEBOOK_APP_ID || 'your_app_id';
    this.appSecret = process.env.FACEBOOK_APP_SECRET || 'your_app_secret';
  }

  /**
   * Generate Facebook Login URL for page access
   */
  getLoginUrl(redirectUri: string): string {
    const permissions = [
      'pages_manage_metadata',
      'pages_read_engagement',
      'pages_messaging',
      'pages_show_list'
    ].join(',');

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: redirectUri,
      scope: permissions,
      response_type: 'code',
      state: 'facebook_auth'
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
    try {
      const params = new URLSearchParams({
        client_id: this.appId,
        client_secret: this.appSecret,
        redirect_uri: redirectUri,
        code: code
      });

      const response = await fetch(`${this.baseUrl}/oauth/access_token?${params.toString()}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(`Facebook API Error: ${data.error.message}`);
      }

      return data.access_token;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  /**
   * Get user's Facebook pages
   */
  async getUserPages(userAccessToken: string): Promise<FacebookPage[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me/accounts?access_token=${userAccessToken}&fields=id,name,access_token,category,tasks`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(`Facebook API Error: ${data.error.message}`);
      }

      return data.data || [];
    } catch (error) {
      console.error('Error fetching user pages:', error);
      throw error;
    }
  }

  /**
   * Get conversations for a Facebook page
   */
  async getPageConversations(pageAccessToken: string, pageId: string): Promise<FacebookConversation[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${pageId}/conversations?access_token=${pageAccessToken}&fields=id,participants,updated_time,message_count,unread_count,can_reply&limit=50`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(`Facebook API Error: ${data.error.message}`);
      }

      return data.data || [];
    } catch (error) {
      console.error('Error fetching page conversations:', error);
      throw error;
    }
  }

  /**
   * Get messages from a conversation
   */
  async getConversationMessages(pageAccessToken: string, conversationId: string): Promise<FacebookMessage[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${conversationId}/messages?access_token=${pageAccessToken}&fields=id,created_time,from,to,message,attachments&limit=50`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(`Facebook API Error: ${data.error.message}`);
      }

      return data.data || [];
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      throw error;
    }
  }

  /**
   * Get user info by user ID
   */
  async getUserInfo(userId: string, accessToken: string): Promise<{ id: string; name: string; profile_pic?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${userId}?access_token=${accessToken}&fields=id,name,profile_pic`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(`Facebook API Error: ${data.error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  /**
   * Send a message to a user
   */
  async sendMessage(pageAccessToken: string, recipientId: string, message: string): Promise<{ message_id: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me/messages?access_token=${pageAccessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text: message },
            messaging_type: 'RESPONSE'
          })
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(`Facebook API Error: ${data.error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Mark conversation as read
   */
  async markConversationAsRead(pageAccessToken: string, conversationId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${conversationId}?access_token=${pageAccessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            read: true
          })
        }
      );

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      return false;
    }
  }

  /**
   * Subscribe to page webhooks
   */
  async subscribeToWebhooks(pageAccessToken: string, pageId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${pageId}/subscribed_apps?access_token=${pageAccessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscribed_fields: ['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads']
          })
        }
      );

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('Error subscribing to webhooks:', error);
      return false;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.appSecret)
        .update(payload)
        .digest('hex');
      
      return `sha256=${expectedSignature}` === signature;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Process webhook data
   */
  processWebhookData(webhookData: { entry: FacebookWebhookEntry[] }): Array<{
    type: 'message' | 'delivery' | 'read';
    pageId: string;
    senderId: string;
    recipientId: string;
    timestamp: number;
    message?: string;
    messageId?: string;
    attachments?: Array<{ type: string; url: string }>;
  }> {
    const processedEvents: Array<{
      type: 'message' | 'delivery' | 'read';
      pageId: string;
      senderId: string;
      recipientId: string;
      timestamp: number;
      message?: string;
      messageId?: string;
      attachments?: Array<{ type: string; url: string }>;
    }> = [];

    webhookData.entry.forEach(entry => {
      if (entry.messaging) {
        entry.messaging.forEach(messagingEvent => {
          if (messagingEvent.message) {
            // New message received
            processedEvents.push({
              type: 'message',
              pageId: entry.id,
              senderId: messagingEvent.sender.id,
              recipientId: messagingEvent.recipient.id,
              timestamp: messagingEvent.timestamp,
              message: messagingEvent.message.text,
              messageId: messagingEvent.message.mid,
              attachments: messagingEvent.message.attachments?.map(att => ({
                type: att.type,
                url: att.payload.url
              }))
            });
          } else if (messagingEvent.delivery) {
            // Message delivered
            processedEvents.push({
              type: 'delivery',
              pageId: entry.id,
              senderId: messagingEvent.sender.id,
              recipientId: messagingEvent.recipient.id,
              timestamp: messagingEvent.timestamp
            });
          } else if (messagingEvent.read) {
            // Message read
            processedEvents.push({
              type: 'read',
              pageId: entry.id,
              senderId: messagingEvent.sender.id,
              recipientId: messagingEvent.recipient.id,
              timestamp: messagingEvent.timestamp
            });
          }
        });
      }
    });

    return processedEvents;
  }
}

export const facebookAPI = new FacebookAPIService();