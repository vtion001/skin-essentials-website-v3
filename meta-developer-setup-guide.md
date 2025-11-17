# 📘 Meta Developer Setup Guide - LocalTunnel URL

## 🎯 Current Setup
- **Tunnel URL**: `https://skin-essentials-admin.loca.lt`
- **Status**: ✅ Working (verified)
- **Environment**: Updated in `.env.local`

## 🔗 Step-by-Step Meta Developer Configuration

### 1. Access Meta Developer Dashboard
1. Go to: https://developers.facebook.com/apps/
2. Select your app: **Skin Essentials by Her** (App ID: 764719166731391)

### 2. Update App Domains
**Location**: Settings → Basic → App Domains

**Add these domains:**
```
skin-essentials-admin.loca.lt
localhost
```

### 3. Configure Facebook Login
**Location**: Facebook Login → Settings

**Valid OAuth Redirect URIs:**
```
https://skin-essentials-admin.loca.lt/api/auth/facebook
http://localhost:3001/api/auth/facebook
```

### 4. Configure Webhooks
**Location**: Webhooks → Product: Page

**Callback URL:**
```
https://skin-essentials-admin.loca.lt/api/webhooks/facebook
```

**Verify Token:**
```
fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3
```

**Subscription Fields:**
- messages
- messaging_postbacks
- messaging_optins
- messaging_deliveries
- messaging_reads

### 5. Instagram Configuration
**Location**: Instagram → Basic Display

**Valid OAuth Redirect URIs:**
```
https://skin-essentials-admin.loca.lt/api/auth/instagram
http://localhost:3001/api/auth/instagram
```

**Deauthorize Callback URL:**
```
https://skin-essentials-admin.loca.lt/api/webhooks/instagram/deauthorize
```

### 6. App Review Requirements
**For production use, you'll need these permissions:**
- pages_show_list
- pages_read_engagement
- pages_manage_metadata
- pages_messaging
- instagram_basic
- instagram_content_publish

## 🧪 Testing Checklist

### ✅ Test Webhook Verification
Run this command:
```bash
curl "https://skin-essentials-admin.loca.lt/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3&hub.challenge=TEST123"
```
**Expected Result**: `TEST123`

### ✅ Test Admin Dashboard
**URL**: https://skin-essentials-admin.loca.lt/admin
**Expected**: Login page loads successfully

### ✅ Test Facebook OAuth Flow
1. Go to admin dashboard
2. Click "Connect Facebook Account"
3. Complete Facebook authorization
4. Should redirect back to admin dashboard with success message

### ✅ Test Page Messaging
1. Send message to your Facebook page
2. Check admin dashboard "Conversations" tab
3. Message should appear within 30 seconds

## 🚨 Common Issues & Solutions

### Issue: "URL blocked" or "Invalid redirect URI"
**Solution**: Double-check that the exact URLs match in Meta settings and `.env.local`

### Issue: Webhook verification fails
**Solution**: 
1. Verify token must be exactly: `fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3`
2. Check tunnel is working: `./simple-monitor.sh`

### Issue: Slow tunnel performance
**Solution**: 
1. Restart tunnel: `./restart-tunnel.sh`
2. Consider upgrading to paid service for better performance

## 📋 Quick Reference Commands

```bash
# Check tunnel health
./simple-monitor.sh

# Restart tunnel
./restart-tunnel.sh

# Test webhook
curl "https://skin-essentials-admin.loca.lt/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3&hub.challenge=TEST123"

# Access admin
open https://skin-essentials-admin.loca.lt/admin
```

## 🎯 Next Steps After Setup
1. Update Meta Developer settings (above)
2. Test OAuth flow
3. Test webhook verification
4. Test message synchronization
5. Monitor performance