/**
 * Instagram Basic Display API Integration Service
 * Handles authentication and message management for Instagram Business accounts
 */

export interface InstagramUser {
  id: string;
  username: string;
  account_type: 'BUSINESS' | 'MEDIA_CREATOR' | 'PERSONAL';
  media_count: number;
}

export interface InstagramConversation {
  id: string;
  participants: Array<{
    id: string;
    username: string;
    profile_picture_url?: string;
  }>;
  updated_time: string;
  message_count: number;
  unread_count: number;
}

export interface InstagramMessage {
  id: string;
  created_time: string;
  from: {
    id: string;
    username: string;
    profile_picture_url?: string;
  };
  to: {
    id: string;
    username: string;
  };
  text?: string;
  attachments?: Array<{
    id: string;
    type: 'image' | 'video' | 'audio';
    url: string;
    preview_url?: string;
  }>;
}

export interface InstagramWebhookEntry {
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
  }>;
}

class InstagramAPIService {
  private readonly baseUrl = 'https://graph.instagram.com';
  private readonly graphUrl = 'https://graph.facebook.com/v18.0';
  private readonly appId: string;
  private readonly appSecret: string;

  constructor() {
    // In production, these should come from environment variables
    this.appId = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID || 'your_app_id';
    this.appSecret = process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET || 'your_app_secret';
  }

  /**
   * Generate Instagram Login URL for basic access
   */
  getLoginUrl(redirectUri: string): string {
    const permissions = [
      'instagram_basic',
      'instagram_manage_messages',
      'pages_show_list',
      'pages_read_engagement'
    ].join(',');

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: redirectUri,
      scope: permissions,
      response_type: 'code',
      state: 'instagram_auth'
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
    try {
      const params = new URLSearchParams({
        client_id: this.appId,
        client_secret: this.appSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
      });

      const response = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error_description || data.error}`);
      }

      return data.access_token;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  /**
   * Get long-lived access token
   */
  async getLongLivedToken(shortLivedToken: string): Promise<{ access_token: string; expires_in: number }> {
    try {
      const params = new URLSearchParams({
        grant_type: 'ig_exchange_token',
        client_secret: this.appSecret,
        access_token: shortLivedToken
      });

      const response = await fetch(`${this.baseUrl}/access_token?${params.toString()}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting long-lived token:', error);
      throw error;
    }
  }

  /**
   * Get Instagram user info
   */
  async getUserInfo(accessToken: string): Promise<InstagramUser> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  /**
   * Get Instagram Business Account conversations (requires Facebook Graph API)
   */
  async getConversations(pageAccessToken: string, instagramBusinessAccountId: string): Promise<InstagramConversation[]> {
    try {
      const response = await fetch(
        `${this.graphUrl}/${instagramBusinessAccountId}/conversations?access_token=${pageAccessToken}&fields=id,participants,updated_time,message_count,unread_count&limit=50`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      return data.data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  /**
   * Get messages from a conversation
   */
  async getConversationMessages(pageAccessToken: string, conversationId: string): Promise<InstagramMessage[]> {
    try {
      const response = await fetch(
        `${this.graphUrl}/${conversationId}/messages?access_token=${pageAccessToken}&fields=id,created_time,from,to,text,attachments&limit=50`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      return data.data || [];
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      throw error;
    }
  }

  /**
   * Send a message via Instagram (requires Instagram Business Account)
   */
  async sendMessage(pageAccessToken: string, recipientId: string, message: string): Promise<{ message_id: string }> {
    try {
      const response = await fetch(
        `${this.graphUrl}/me/messages?access_token=${pageAccessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text: message }
          })
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get Instagram Business Account ID from Facebook Page
   */
  async getInstagramBusinessAccount(pageAccessToken: string, pageId: string): Promise<{ id: string; username: string } | null> {
    try {
      const response = await fetch(
        `${this.graphUrl}/${pageId}?fields=instagram_business_account{id,username}&access_token=${pageAccessToken}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      return data.instagram_business_account || null;
    } catch (error) {
      console.error('Error fetching Instagram business account:', error);
      return null;
    }
  }

  /**
   * Subscribe to Instagram webhooks
   */
  async subscribeToWebhooks(pageAccessToken: string, instagramBusinessAccountId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.graphUrl}/${instagramBusinessAccountId}/subscribed_apps?access_token=${pageAccessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscribed_fields: ['messages']
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
   * Verify webhook signature (same as Facebook)
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
   * Process Instagram webhook data
   */
  processWebhookData(webhookData: { entry: InstagramWebhookEntry[] }): Array<{
    type: 'message';
    accountId: string;
    senderId: string;
    recipientId: string;
    timestamp: number;
    message?: string;
    messageId?: string;
    attachments?: Array<{ type: string; url: string }>;
  }> {
    const processedEvents: Array<{
      type: 'message';
      accountId: string;
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
            processedEvents.push({
              type: 'message',
              accountId: entry.id,
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
          }
        });
      }
    });

    return processedEvents;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(accessToken: string): Promise<{ access_token: string; expires_in: number }> {
    try {
      const params = new URLSearchParams({
        grant_type: 'ig_refresh_token',
        access_token: accessToken
      });

      const response = await fetch(`${this.baseUrl}/refresh_access_token?${params.toString()}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }
}

export const instagramAPI = new InstagramAPIService();