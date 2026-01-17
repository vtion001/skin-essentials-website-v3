# Facebook Meta Developer Setup Guide

This guide covers setting up Facebook/Meta integration for the Skin Essentials platform.

## Overview

The platform integrates with Facebook to enable:
- Page messaging for customer support
- OAuth authentication for admin users
- Real-time message reception via webhooks
- Message sending through the Graph API

## Prerequisites

- Facebook Developer account
- Verified Facebook Business account
- Facebook Page to connect
- Supabase project configured

## Step 1: Create Facebook App

### 1.1 Create App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click **Create App**
3. Select **Business** type
4. Choose **Business** app type
5. Enter app name: "Skin Essentials"
6. Click **Create App**

### 1.2 Configure Basic Settings

1. Go to **App Dashboard** → **Settings** → **Basic**
2. Note down:
   - **App ID**: `FACEBOOK_APP_ID`
   - **App Secret**: `FACEBOOK_APP_SECRET`
   - **Display Name**

### 1.3 Add Product

1. Go to **Add Product** in left sidebar
2. Click **Set Up** for **Facebook Login**
3. Click **Set Up** for **Messenger**

## Step 2: Configure OAuth

### 2.1 Add Redirect URL

1. Go to **Facebook Login** → **Settings**
2. Add **Valid OAuth Redirect URIs**:
   ```
   https://your-domain.com/api/auth/facebook/callback
   ```
3. Click **Save Changes**

### 2.2 Configure Permissions

1. Go to **App Review** → **Permissions and Features**
2. Add required permissions:
   - `public_profile` - Basic profile information
   - `email` - User email address
   - `pages_show_list` - List user's pages
   - `pages_read_engagement` - Read page engagement data
   - `pages_manage_metadata` - Manage page metadata
   - `pages_messaging` - Send/receive page messages

3. Optional permissions (if needed):
   - `pages_manage_posts` - Create/manage posts
   - `business_management` - Business account management
   - `pages_read_user_content` - Read page content

### 2.3 Submit for Review

For production use, submit permissions for review:
1. Click **Request** next to each permission
2. Provide:
   - Screenshots of the permission in use
   - Video demonstration (if required)
   - Explanation of why permission is needed
3. Wait for Facebook approval

**Development Testing**: You can test without review in development mode with a tester account.

## Step 3: Configure Messenger

### 3.1 Setup Messenger

1. Go to **Messenger** → **Settings**
2. Add a **Page**:
   - Click **Add Page**
   - Select a Facebook page from your account
   - Generate **Page Access Token**
   - Store this token securely (server-side only!)

### 3.2 Configure Webhooks

1. Go to **Webhooks** section in Messenger settings
2. Click **Setup Webhooks**
3. Enter:
   - **Callback URL**: `https://your-domain.com/api/webhooks/facebook`
   - **Verify Token**: Generate a secure random string (e.g., `openssl rand -base64 32`)
   - This becomes `FACEBOOK_WEBHOOK_VERIFY_TOKEN`

4. Click **Verify and Save**

5. Select subscription fields:
   - `messages` - Receive messages
   - `messaging_postbacks` - Receive postback events
   - `message_deliveries` - Delivery confirmations
   - `message_reads` - Read receipts

### 3.3 Subscribe Page to Webhook

1. In the Webhooks section, select your page
2. Click **Subscribe** next to each field
3. The page will now send webhook events to your callback URL

## Step 4: Environment Variables

Add these to your `.env.local`:

```env
# Facebook App Credentials
FACEBOOK_APP_ID=your-app-id-here
FACEBOOK_APP_SECRET=your-app-secret-here
FACEBOOK_REDIRECT_URI=https://your-domain.com/api/auth/facebook/callback
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your-random-verify-token

# Base URL
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

**Security Notes**:
- Never expose `FACEBOOK_APP_SECRET` to the client
- Store `FACEBOOK_WEBHOOK_VERIFY_TOKEN` securely
- Use HTTPS for all callback URLs
- Rotate tokens periodically

## Step 5: Test Integration

### 5.1 Test OAuth Flow

1. Navigate to `/api/auth/facebook`
2. Authorize your Facebook account
3. Verify redirect to callback URL
4. Check Supabase for user creation

### 5.2 Test Webhook

1. Send a message to your connected Facebook page
2. Check `/admin/developer` → **Live Logs**
3. Verify webhook payload received
4. Check Supabase `social_messages` table

### 5.3 Test Message Sending

1. Use the admin dashboard to send a test message
2. Verify message appears on Facebook page
3. Check for delivery receipts

## API Endpoints

### Authentication

```
GET /api/auth/facebook
```
Starts OAuth flow

```
POST /api/auth/facebook/callback
```
Handles OAuth callback from Facebook

### Webhook

```
POST /api/webhooks/facebook
```
Receives real-time events from Facebook

**Verification**:
```
GET /api/webhooks/facebook?hub_mode=subscribe&hub_verify_token=TOKEN&hub_challenge=CHALLENGE
```

## Webhook Security

### Signature Verification

The webhook endpoint verifies the `x-hub-signature-256` header:

```typescript
// app/api/webhooks/facebook/route.ts
const signature = headers.get('x-hub-signature-256');
const expectedSignature = `sha256=${hmac('sha256', FACEBOOK_APP_SECRET, body)}`;
if (signature !== expectedSignature) {
  return new Response('Invalid signature', { status: 401 });
}
```

### Rate Limiting

Implement rate limiting to prevent abuse:
- Limit requests per IP
- Use exponential backoff for retries
- Monitor webhook delivery status

### Webhook Validation

Facebook provides webhook verification:
```bash
curl -X GET \
  "https://your-domain.com/api/webhooks/facebook?hub_mode=subscribe&hub_verify_token=YOUR_TOKEN&hub_challenge=CHALLENGE"
```

Should return the challenge value.

## Page Access Token Management

### Generate Long-Lived Token

The short-lived token expires quickly. Convert to long-lived:

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
```

### Refresh Token

Long-lived tokens expire after 60 days. Implement refresh logic:

```typescript
// lib/services/facebook-token.service.ts
export async function refreshToken(pageId: string, currentToken: string) {
  const res = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&fb_exchange_token=${currentToken}`
  );
  const data = await res.json();
  // Update token in database
  await supabase.from('social_platform_connections')
    .update({ access_token: data.access_token })
    .eq('platform_page_id', pageId);
}
```

## Common Issues

### Webhook Not Receiving Events

**Solutions**:
1. Verify callback URL is publicly accessible
2. Check firewall allows Facebook servers
3. Ensure SSL certificate is valid
4. Verify webhook is subscribed to page

### Token Expired

**Symptoms**: API calls return `190: Access token has expired`

**Solution**: Implement token refresh logic or manually regenerate in Facebook dashboard

### Permission Denied

**Symptoms**: API calls return `200: Permissions error`

**Solutions**:
1. Verify permissions are granted
2. Check app review status
3. Ensure page is connected to app
4. Verify token has required scopes

### Webhook Verification Fails

**Symptoms**: Webhook setup fails verification

**Solutions**:
1. Verify token matches `FACEBOOK_WEBHOOK_VERIFY_TOKEN`
2. Check server is running and accessible
3. Ensure endpoint returns challenge value
4. Check server logs for errors

## Best Practices

### Security

1. **Never store tokens in client-side code**
2. **Use HTTPS for all endpoints**
3. **Verify webhook signatures**
4. **Implement rate limiting**
5. **Rotate tokens regularly**
6. **Monitor for suspicious activity**

### Performance

1. **Use webhook events instead of polling**
2. **Implement incremental sync**
3. **Cache page information**
4. **Batch message requests**
5. **Use Supabase Realtime for updates**

### Monitoring

1. **Log all API calls**
2. **Track webhook delivery rate**
3. **Monitor token expiration**
4. **Alert on failed requests**
5. **Audit message delivery**

## Testing

### Development Testing

Use Facebook's Webhooks Testing Tool:
1. Go to **Webhooks** → **Testing**
2. Select your page
3. Send test events
4. Verify payload received

### Production Testing

1. Enable logging in production
2. Monitor error logs via Developer Mode
3. Test with real customer interactions
4. Validate message delivery times

## Compliance and Privacy

### GDPR

- Obtain consent for data processing
- Provide data export on request
- Implement data deletion on request
- Document data processing activities

### HIPAA (if applicable)

- Ensure secure data transmission
- Encrypt stored messages
- Implement access controls
- Maintain audit logs
- Use Business Associate Agreement

## Additional Resources

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Messenger Platform Docs](https://developers.facebook.com/docs/messenger-platform)
- [Webhooks Guide](https://developers.facebook.com/docs/graph-api/webhooks)
- [Page Access Tokens](https://developers.facebook.com/docs/pages/access-tokens)

## Related Documentation

- [Social Media Architecture](social-media-architecture.md) - Full architecture details
- [Production Setup](production-setup.md) - General configuration
- [Developer Mode](developer-mode.md) - Monitoring and debugging

---

**Last Updated**: January 17, 2026
