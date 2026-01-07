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

// Facebook OAuth Configuration
export interface FacebookOAuthConfig {
  appId: string
  appSecret: string
  redirectUri: string
  scope: string[]
  responseType: 'code'
  state?: string
}

// Facebook Permission Definitions
export const FACEBOOK_PERMISSIONS = {
  // Basic permissions
  PUBLIC_PROFILE: 'public_profile',
  EMAIL: 'email',

  // Page permissions
  PAGES_SHOW_LIST: 'pages_show_list',
  PAGES_READ_ENGAGEMENT: 'pages_read_engagement',
  PAGES_MANAGE_METADATA: 'pages_manage_metadata',
  PAGES_MANAGE_POSTS: 'pages_manage_posts',
  PAGES_MESSAGING: 'pages_messaging',

  // Business permissions
  BUSINESS_MANAGEMENT: 'business_management',
  PAGES_READ_USER_CONTENT: 'pages_read_user_content',

  // Instagram permissions (if needed)
  INSTAGRAM_BASIC: 'instagram_basic',
  INSTAGRAM_MANAGE_MESSAGES: 'instagram_manage_messages'
} as const

export const REQUIRED_PERMISSIONS = [
  FACEBOOK_PERMISSIONS.PUBLIC_PROFILE,
  FACEBOOK_PERMISSIONS.EMAIL,
  FACEBOOK_PERMISSIONS.PAGES_SHOW_LIST,
  FACEBOOK_PERMISSIONS.PAGES_READ_ENGAGEMENT,
  FACEBOOK_PERMISSIONS.PAGES_MANAGE_METADATA,
  FACEBOOK_PERMISSIONS.PAGES_MESSAGING
]

export const OPTIONAL_PERMISSIONS = [
  FACEBOOK_PERMISSIONS.PAGES_MANAGE_POSTS,
  FACEBOOK_PERMISSIONS.BUSINESS_MANAGEMENT,
  FACEBOOK_PERMISSIONS.PAGES_READ_USER_CONTENT
]

// Permission descriptions for UI display
export const PERMISSION_DESCRIPTIONS = {
  [FACEBOOK_PERMISSIONS.PUBLIC_PROFILE]: {
    title: 'Public Profile',
    description: 'Access your basic profile information',
    required: true
  },
  [FACEBOOK_PERMISSIONS.EMAIL]: {
    title: 'Email Address',
    description: 'Access your email address for account linking',
    required: true
  },
  [FACEBOOK_PERMISSIONS.PAGES_SHOW_LIST]: {
    title: 'Page List Access',
    description: 'View the list of pages you manage',
    required: true
  },
  [FACEBOOK_PERMISSIONS.PAGES_READ_ENGAGEMENT]: {
    title: 'Page Engagement',
    description: 'Read engagement data from your pages',
    required: true
  },
  [FACEBOOK_PERMISSIONS.PAGES_MANAGE_METADATA]: {
    title: 'Page Metadata',
    description: 'Manage basic page information and settings',
    required: true
  },
  [FACEBOOK_PERMISSIONS.PAGES_MESSAGING]: {
    title: 'Page Messaging',
    description: 'Send and receive messages on behalf of your pages',
    required: true
  },
  [FACEBOOK_PERMISSIONS.PAGES_MANAGE_POSTS]: {
    title: 'Manage Posts',
    description: 'Create, edit, and delete posts on your pages',
    required: false
  },
  [FACEBOOK_PERMISSIONS.BUSINESS_MANAGEMENT]: {
    title: 'Business Management',
    description: 'Access business account information',
    required: false
  },
  [FACEBOOK_PERMISSIONS.PAGES_READ_USER_CONTENT]: {
    title: 'User Content',
    description: 'Read content posted by users on your pages',
    required: false
  }
}

class FacebookAPIService {
  private readonly baseUrl = 'https://graph.facebook.com/v18.0';
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly redirectUri: string;

  constructor() {
    // In production, these should come from environment variables
    this.appId = process.env.FACEBOOK_APP_ID || 'your_app_id';
    this.appSecret = process.env.FACEBOOK_APP_SECRET || 'your_app_secret';
    this.redirectUri = process.env.FACEBOOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/facebook/callback`;

    if (!this.appId || !this.appSecret) {
      console.warn('Facebook API credentials not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables.');
    }
  }

  /**
   * Validate if an access token is still valid
   */
  async validateAccessToken(accessToken: string): Promise<{ isValid: boolean; error?: string; expiresAt?: number }> {
    try {
      if (!accessToken || accessToken.trim() === '' || accessToken === 'your_access_token') {
        return { isValid: false, error: 'Token is empty or placeholder' };
      }

      const isServer = typeof window === 'undefined';
      if (!isServer) {
        return { isValid: true };
      }

      const response = await fetch(`${this.baseUrl}/me?access_token=${accessToken}&fields=id,name`);
      const data = await response.json();
      if (data.error) {
        return { isValid: false, error: `${data.error.type || 'OAuthException'}: ${data.error.message}` };
      }
      const hasRealSecrets = this.appId !== 'your_app_id' && this.appSecret !== 'your_app_secret';

      if (isServer && hasRealSecrets) {
        const debugResponse = await fetch(
          `${this.baseUrl}/debug_token?input_token=${accessToken}&access_token=${this.appId}|${this.appSecret}`
        );
        const debugData = await debugResponse.json();
        if (debugData.data && debugData.data.is_valid) {
          return { isValid: true, expiresAt: debugData.data.expires_at };
        }
        return { isValid: false, error: 'Token is not valid according to debug endpoint' };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: `Validation request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Refresh a short-lived token to get a long-lived token
   */
  async refreshLongLivedToken(shortLivedToken: string): Promise<{ accessToken?: string; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${this.appId}&` +
        `client_secret=${this.appSecret}&` +
        `fb_exchange_token=${shortLivedToken}`
      );

      const data = await response.json();

      if (data.error) {
        return {
          error: data.error.message || 'Failed to refresh token'
        };
      }

      return {
        accessToken: data.access_token
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown refresh error'
      };
    }
  }

  /**
   * Get page access token from user access token
   */
  async getPageAccessToken(userAccessToken: string, pageId: string): Promise<{ accessToken?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${pageId}?fields=access_token&access_token=${userAccessToken}`);

      const data = await response.json();

      if (data.error) {
        return {
          error: data.error.message || 'Failed to get page access token'
        };
      }

      return {
        accessToken: data.access_token
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error getting page token'
      };
    }
  }

  /**
   * Enhanced error handling for API responses
   */
  private handleAPIError(data: any, context: string): never {
    if (data.error) {
      const errorType = data.error.type || 'Unknown';
      const errorMessage = data.error.message || 'Unknown error';
      const errorCode = data.error.code || 'N/A';

      console.error(`Facebook API Error in ${context}:`, {
        type: errorType,
        message: errorMessage,
        code: errorCode,
        subcode: data.error.error_subcode,
        userTitle: data.error.error_user_title,
        userMessage: data.error.error_user_msg
      });

      // Specific handling for token-related errors
      if (errorType === 'OAuthException' || errorCode === 190) {
        throw new Error(`Facebook API Error: Invalid OAuth access token - ${errorMessage}`);
      }

      throw new Error(`Facebook API Error: ${errorMessage} (Type: ${errorType}, Code: ${errorCode})`);
    }

    throw new Error(`Facebook API Error: Unexpected response format in ${context}`);
  }

  /**
   * Generate secure Facebook login URL for OAuth flow with comprehensive permissions
   */
  generateLoginUrl(options: {
    state?: string
    includeOptionalPermissions?: boolean
    customRedirectUri?: string
  } = {}): string {
    const { state, includeOptionalPermissions = false, customRedirectUri } = options

    // Generate secure state parameter if not provided
    const secureState = state || this.generateSecureState()

    // Combine required and optional permissions based on user choice
    const permissions = includeOptionalPermissions
      ? [...REQUIRED_PERMISSIONS, ...OPTIONAL_PERMISSIONS]
      : REQUIRED_PERMISSIONS

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: customRedirectUri || this.redirectUri,
      scope: permissions.join(','),
      response_type: 'code',
      state: secureState,
      auth_type: 'rerequest', // Force permission dialog even if previously authorized
      display: 'popup' // Better UX for web applications
    })

    console.log(`Generated Facebook OAuth URL with permissions: ${permissions.join(', ')}`)
    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`
  }

  /**
   * Generate secure state parameter for OAuth flow
   */
  private generateSecureState(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2)
    return Buffer.from(`${timestamp}-${random}`).toString('base64')
  }

  /**
   * Validate OAuth state parameter
   */
  validateOAuthState(state: string): boolean {
    try {
      const decoded = Buffer.from(state, 'base64').toString()
      const [timestamp] = decoded.split('-')
      const stateAge = Date.now() - parseInt(timestamp)

      // State should be used within 10 minutes
      return stateAge < 10 * 60 * 1000
    } catch {
      return false
    }
  }

  /**
   * Generate Facebook Login URL for page access (legacy method)
   */
  getLoginUrl(redirectUri: string): string {
    return this.generateLoginUrl({ customRedirectUri: redirectUri })
  }

  /**
   * Exchange authorization code for access token with comprehensive validation
   */
  async exchangeCodeForToken(
    code: string,
    state: string,
    redirectUri?: string
  ): Promise<{
    accessToken?: string
    userInfo?: any
    grantedPermissions?: string[]
    error?: string
  }> {
    try {
      // Validate state parameter for security
      if (!this.validateOAuthState(state)) {
        return { error: 'Invalid or expired state parameter. Please try again.' }
      }

      console.log('Exchanging authorization code for access token...')

      const response = await fetch(`${this.baseUrl}/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.appId,
          client_secret: this.appSecret,
          redirect_uri: redirectUri || this.redirectUri,
          code: code,
        }),
      })

      const data = await response.json()

      if (data.error) {
        console.error('Facebook token exchange error:', data.error)
        return { error: `Facebook authentication failed: ${data.error.message}` }
      }

      const accessToken = data.access_token

      // Verify token and get user information
      const userInfoResult = await this.getUserInfo(accessToken)
      if (userInfoResult.error) {
        return { error: `Failed to verify user information: ${userInfoResult.error}` }
      }

      // Get granted permissions
      const permissionsResult = await this.getGrantedPermissions(accessToken)
      const grantedPermissions = permissionsResult.permissions || []

      // Verify required permissions are granted
      const missingPermissions = REQUIRED_PERMISSIONS.filter(
        permission => !grantedPermissions.includes(permission)
      )

      if (missingPermissions.length > 0) {
        console.warn('Missing required permissions:', missingPermissions)
        return {
          error: `Missing required permissions: ${missingPermissions.join(', ')}. Please grant all required permissions and try again.`
        }
      }

      console.log('Facebook authentication successful with permissions:', grantedPermissions)

      return {
        accessToken,
        userInfo: userInfoResult.user,
        grantedPermissions
      }
    } catch (error) {
      console.error('Token exchange error:', error)
      return { error: error instanceof Error ? error.message : 'Unknown authentication error' }
    }
  }

  /**
   * Get granted permissions for a user access token
   */
  async getGrantedPermissions(accessToken: string): Promise<{ permissions?: string[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/me/permissions?access_token=${accessToken}`)
      const data = await response.json()

      if (data.error) {
        return { error: data.error.message }
      }

      const grantedPermissions = data.data
        .filter((perm: any) => perm.status === 'granted')
        .map((perm: any) => perm.permission)

      return { permissions: grantedPermissions }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to get permissions' }
    }
  }

  /**
   * Get user's Facebook pages
   */
  async getUserPages(userAccessToken: string): Promise<FacebookPage[]> {
    try {
      const validation = await this.validateAccessToken(userAccessToken);
      if (!validation.isValid) {
        return [];
      }

      const response = await fetch(
        `${this.baseUrl}/me/accounts?access_token=${userAccessToken}&fields=id,name,access_token,category,tasks`
      );
      const data = await response.json();

      if (data.error) {
        return [];
      }

      return data.data || [];
    } catch (error) {
      console.warn('Error fetching user pages:', error);
      return [];
    }
  }

  /**
   * Get conversations for a Facebook page
   */
  async getPageConversations(pageAccessToken: string, pageId: string): Promise<FacebookConversation[]> {
    try {
      const isServer = typeof window === 'undefined';
      if (!isServer) {
        const resp = await fetch('/api/facebook/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
          body: JSON.stringify({ accessToken: pageAccessToken, pageId })
        })
        const json = await resp.json()
        return json.conversations || []
      }

      const validation = await this.validateAccessToken(pageAccessToken);
      if (!validation.isValid) {
        return [];
      }

      const response = await fetch(
        `${this.baseUrl}/${pageId}/conversations?access_token=${pageAccessToken}&fields=id,participants,updated_time,message_count,unread_count,can_reply&limit=50`
      );
      const data = await response.json();

      if (data.error) {
        return [];
      }

      return data.data || [];
    } catch (error) {
      console.warn('Error fetching page conversations:', error);
      return [];
    }
  }

  /**
   * Get messages from a conversation
   */
  async getConversationMessages(pageAccessToken: string, conversationId: string): Promise<FacebookMessage[]> {
    try {
      const isServer = typeof window === 'undefined';
      if (!isServer) {
        const resp = await fetch('/api/facebook/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
          body: JSON.stringify({ accessToken: pageAccessToken, conversationId })
        })
        const json = await resp.json()
        return json.messages || []
      }

      const validation = await this.validateAccessToken(pageAccessToken);
      if (!validation.isValid) {
        return [];
      }

      const response = await fetch(
        `${this.baseUrl}/${conversationId}/messages?access_token=${pageAccessToken}&fields=id,created_time,from,to,message,attachments&limit=50`
      );
      const data = await response.json();

      if (data.error) {
        return [];
      }

      return data.data || [];
    } catch (error) {
      console.warn('Error fetching conversation messages:', error);
      return [];
    }
  }

  /**
   * Get user info by user ID or current user
   */
  async getUserInfo(accessTokenOrUserId: string, accessToken?: string): Promise<{ user?: { id: string; name: string; email?: string; profile_pic?: string; picture?: { data?: { url?: string } } }; error?: string }> {
    try {
      const isServer = typeof window === 'undefined'
      let data: any
      if (!isServer && accessToken) {
        const resp = await fetch('/api/facebook/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
          body: JSON.stringify({ accessToken, userId: accessTokenOrUserId })
        })
        data = await resp.json()
        if (data && data.user) data = data.user
      } else {
        let url: string
        if (accessToken) {
          url = `${this.baseUrl}/${accessTokenOrUserId}?access_token=${accessToken}&fields=id,name,picture.type(large)`;
        } else {
          url = `${this.baseUrl}/me?access_token=${accessTokenOrUserId}&fields=id,name,email,picture.type(large)`;
        }
        const response = await fetch(url);
        data = await response.json();
      }

      if (data.error) {
        return { error: data.error.message };
      }

      return { user: data };
    } catch (error) {
      console.error('Error fetching user info:', error);
      return { error: error instanceof Error ? error.message : 'Failed to get user info' };
    }
  }

  /**
   * Send a message to a user
   */
  async sendMessage(pageAccessToken: string, recipientId: string, message: string): Promise<{ message_id: string }> {
    try {
      // Validate token first
      const validation = await this.validateAccessToken(pageAccessToken);
      if (!validation.isValid) {
        throw new Error(`Invalid page access token: ${validation.error}`);
      }

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
        this.handleAPIError(data, 'sendMessage');
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