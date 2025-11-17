# Cloudflare Access Bypass Rules - Quick Reference

## Application Setup
1. **URL**: https://one.dash.cloudflare.com/
2. **Navigate**: Zero Trust → Access → Applications → Add application
3. **Type**: Self-hosted

## Application Configuration
- **Name**: Admin Dashboard
- **Domain**: admin.skinessentialsbyher.com
- **Session Duration**: 24 hours (or as preferred)

## Bypass Policy (Create First)
- **Policy Name**: Bypass OAuth/Webhooks
- **Action**: Bypass
- **Include**: Everyone
- **Path Rules** (Add each as "Path starts with"):
  ```
  /api/auth/facebook
  /api/webhooks/facebook
  /api/auth/instagram
  /api/webhooks/instagram/deauthorize
  /api/webhooks/instagram/delete
  ```

## Optional: Require Login Policy (Create Second)
- **Policy Name**: Require Login
- **Action**: Allow
- **Include**: Everyone (or specific email domains)
- **Additional Rules**: None (applies to all other paths)

## Important Notes
- The Bypass policy MUST be listed before the Require Login policy
- Facebook/Meta will not follow redirects or login pages
- These bypass rules ensure OAuth flows work without interruption

## Meta Developer Updates Required
After tunnel is active, update:
- **App Domains**: `admin.skinessentialsbyher.com`
- **OAuth Redirect URI**: `https://admin.skinessentialsbyher.com/api/auth/facebook`
- **Webhook Callback**: `https://admin.skinessentialsbyher.com/api/webhooks/facebook`

## Test URLs
- **Webhook Verification**: 
  ```
  https://admin.skinessentialsbyher.com/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3&hub.challenge=TEST123
  ```
- **Expected Response**: `TEST123`

- **OAuth Flow**: 
  - Start: `https://admin.skinessentialsbyher.com/admin`
  - Connect Facebook → Should redirect back to admin dashboard