# Cloudflare Tunnel Setup Instructions

## Prerequisites Completed ✅
- ✅ cloudflared installed at `/opt/homebrew/bin/cloudflared`
- ✅ Local dev server running on localhost:3001

## Manual Steps Required 🚨

### 1. Complete Browser Authentication
Open this URL in your browser:
```
https://dash.cloudflare.com/argotunnel?aud=&callback=https%3A%2F%2Flogin.cloudflareaccess.org%2FotFVqbIBgxI9vSvYKt7vVBmhzma0_gQ_aNOqt_0nixI%3D
```

After authentication, save the downloaded certificate as `~/.cloudflared/cert.pem`

### 2. Create Tunnel (Run after auth)
```bash
cloudflared tunnel create skin-essentials-admin
```
Note the tunnel UUID that will be displayed.

### 3. Route DNS
```bash
cloudflared tunnel route dns skin-essentials-admin admin.skinessentialsbyher.com
```

### 4. Create Config File
Create `~/.cloudflared/config.yml` with your tunnel UUID:
```yaml
tunnel: <your-tunnel-uuid>
credentials-file: /Users/archerterminez/.cloudflared/<your-tunnel-uuid>.json
ingress:
  - hostname: admin.skinessentialsbyher.com
    service: http://localhost:3001
  - service: http_status:404
```

### 5. Start Tunnel
```bash
cloudflared tunnel run skin-essentials-admin
```

## Environment Variables to Update
After tunnel is running, update your `.env.local`:
```bash
NEXT_PUBLIC_BASE_URL=https://admin.skinessentialsbyher.com
FACEBOOK_REDIRECT_URI=https://admin.skinessentialsbyher.com/api/auth/facebook
INSTAGRAM_REDIRECT_URI=https://admin.skinessentialsbyher.com/api/auth/instagram
INSTAGRAM_DEAUTHORIZE_URI=https://admin.skinessentialsbyher.com/api/webhooks/instagram/deauthorize
INSTAGRAM_DELETE_URI=https://admin.skinessentialsbyher.com/api/webhooks/instagram/delete
```

## Cloudflare Access Bypass Rules
1. Go to Cloudflare Zero Trust → Access → Applications
2. Add Self-hosted application for admin.skinessentialsbyher.com
3. Create Bypass policy for these paths:
   - `/api/auth/facebook`
   - `/api/webhooks/facebook`
   - `/api/auth/instagram`
   - `/api/webhooks/instagram/deauthorize`
   - `/api/webhooks/instagram/delete`

## Meta Developer Updates
Update your Facebook app settings:
- App Domains: `admin.skinessentialsbyher.com`
- OAuth Redirect URI: `https://admin.skinessentialsbyher.com/api/auth/facebook`
- Webhook URL: `https://admin.skinessentialsbyher.com/api/webhooks/facebook`