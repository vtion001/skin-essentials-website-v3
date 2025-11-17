# ✅ Meta Developer Update Checklist

## 🎯 Quick Reference
- **App ID**: 764719166731391
- **Tunnel URL**: https://skin-essentials-admin.loca.lt
- **Webhook Token**: fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3

## 📋 Step-by-Step Update Process

### Step 1: Access Your App
- [ ] Go to https://developers.facebook.com/apps/
- [ ] Click on **"Skin Essentials by Her"** (App ID: 764719166731391)

### Step 2: Update App Domains
**Location**: Settings → Basic → App Domains

**Add these domains** (one per line):
```
skin-essentials-admin.loca.lt
localhost
```

**⚠️ Important**: Remove any old ngrok domains

### Step 3: Configure Facebook Login
**Location**: Facebook Login → Settings

**Valid OAuth Redirect URIs** (add both):
```
https://skin-essentials-admin.loca.lt/api/auth/facebook
http://localhost:3001/api/auth/facebook
```

**⚠️ Important**: Remove any old ngrok URLs

### Step 4: Configure Webhooks
**Location**: Webhooks → Product: Page

**Callback URL**:
```
https://skin-essentials-admin.loca.lt/api/webhooks/facebook
```

**Verify Token**:
```
fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3
```

**Subscription Fields** (check all that apply):
- [ ] messages
- [ ] messaging_postbacks
- [ ] messaging_optins
- [ ] messaging_deliveries
- [ ] messaging_reads

### Step 5: Configure Instagram
**Location**: Instagram → Basic Display

**Valid OAuth Redirect URIs**:
```
https://skin-essentials-admin.loca.lt/api/auth/instagram
http://localhost:3001/api/auth/instagram
```

**Deauthorize Callback URL**:
```
https://skin-essentials-admin.loca.lt/api/webhooks/instagram/deauthorize
```

## 🧪 Testing After Updates

### Test 1: Webhook Verification
Run this command:
```bash
curl "https://skin-essentials-admin.loca.lt/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3&hub.challenge=TEST123"
```
**Expected**: `TEST123`

### Test 2: Admin Dashboard Access
- [ ] Open: https://skin-essentials-admin.loca.lt/admin
- [ ] Should load login page

### Test 3: Facebook OAuth Flow
- [ ] Go to admin dashboard
- [ ] Click "Connect Facebook Account"
- [ ] Complete Facebook authorization
- [ ] Should redirect back to admin with success

### Test 4: Page Messaging
- [ ] Send message to your Facebook page
- [ ] Check admin "Conversations" tab
- [ ] Message should appear

## 🚨 Common Issues & Solutions

### Issue: "URL blocked" error
**Solution**: Double-check App Domains include `skin-essentials-admin.loca.lt`

### Issue: "Invalid redirect URI" error
**Solution**: Ensure OAuth redirect URIs exactly match the tunnel URL

### Issue: Webhook verification fails
**Solution**: 
- Check tunnel is working: `./simple-monitor.sh`
- Verify token is exactly correct
- Check webhook URL in Meta settings

### Issue: Slow performance
**Solution**: 
- Restart tunnel: `./restart-tunnel.sh`
- Test with: `./simple-monitor.sh`

## 📞 Support Commands

```bash
# Check if everything is working
./simple-monitor.sh

# Restart tunnel if slow
./restart-tunnel.sh

# Test webhook manually
curl "https://skin-essentials-admin.loca.lt/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3&hub.challenge=TEST123"

# Access admin dashboard
open https://skin-essentials-admin.loca.lt/admin
```

## ✅ Final Verification
After completing all steps, run:
```bash
./verify-meta-setup.sh
```

**All tests should pass before proceeding!**