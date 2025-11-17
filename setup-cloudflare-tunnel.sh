#!/bin/bash

# Cloudflare Tunnel Setup Helper
# This script guides you through the complete setup process

echo "🚀 Cloudflare Tunnel Setup for Skin Essentials Admin"
echo "=================================================="
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared not found. Please install it first:"
    echo "   brew install cloudflared"
    exit 1
fi

echo "✅ cloudflared found at: $(which cloudflared)"
echo ""

# Step 1: Authentication
echo "📋 STEP 1: Authentication Required"
echo "Please complete browser authentication first:"
echo ""
echo "1. Run this command in a new terminal:"
echo "   cloudflared tunnel login"
echo ""
echo "2. If browser doesn't open automatically, use this URL:"
echo "   https://dash.cloudflare.com/argotunnel?aud=&callback=https%3A%2F%2Flogin.cloudflareaccess.org%2FotFVqbIBgxI9vSvYKt7vVBmhzma0_gQ_aNOqt_0nixI%3D"
echo ""
echo "3. After authentication, save the certificate as ~/.cloudflared/cert.pem"
echo ""
read -p "Press Enter after completing authentication..."

# Step 2: Create Tunnel
echo ""
echo "📋 STEP 2: Creating Tunnel"
echo "Run: cloudflared tunnel create skin-essentials-admin"
echo "Note the tunnel UUID that will be displayed!"
echo ""
read -p "Enter the tunnel UUID (or press Enter to skip): " TUNNEL_UUID

if [ -n "$TUNNEL_UUID" ]; then
    # Step 3: Route DNS
    echo ""
    echo "📋 STEP 3: Routing DNS"
    echo "Run: cloudflared tunnel route dns skin-essentials-admin admin.skinessentialsbyher.com"
    echo ""
    
    # Step 4: Create Config
    echo "📋 STEP 4: Creating Config File"
    CONFIG_FILE="$HOME/.cloudflared/config.yml"
    
    cat > "$CONFIG_FILE" << EOF
tunnel: $TUNNEL_UUID
credentials-file: $HOME/.cloudflared/$TUNNEL_UUID.json
ingress:
  - hostname: admin.skinessentialsbyher.com
    service: http://localhost:3001
  - service: http_status:404
EOF
    
    echo "✅ Config file created at: $CONFIG_FILE"
    echo ""
    
    # Step 5: Environment Variables
    echo "📋 STEP 5: Updating Environment Variables"
    if [ -f ".env.local" ]; then
        cp .env.local .env.local.backup
        
        # Update URLs to use Cloudflare domain
        sed -i '' 's|https://[^/]*\.ngrok-free\.app|https://admin.skinessentialsbyher.com|g' .env.local
        
        echo "✅ Environment variables updated"
        echo "Updated .env.local to use Cloudflare domain"
    else
        echo "⚠️  .env.local not found. You'll need to update manually."
    fi
    
    # Step 6: Instructions for Cloudflare Access
    echo ""
    echo "📋 STEP 6: Cloudflare Access Setup (Manual)"
    echo "Go to: https://one.dash.cloudflare.com/"
    echo "Navigate: Access → Applications → Add application → Self-hosted"
    echo ""
    echo "Application Settings:"
    echo "- Name: Admin Dashboard"
    echo "- Domain: admin.skinessentialsbyher.com"
    echo ""
    echo "Create Bypass Policy:"
    echo "- Policy Name: Bypass OAuth/Webhooks"
    echo "- Include: Everyone"
    echo "- Path rules (add each as 'Path starts with'):"
    echo "  • /api/auth/facebook"
    echo "  • /api/webhooks/facebook"
    echo "  • /api/auth/instagram"
    echo "  • /api/webhooks/instagram/deauthorize"
    echo "  • /api/webhooks/instagram/delete"
    echo ""
    
    # Step 7: Meta Developer Updates
    echo "📋 STEP 7: Meta Developer Settings (Manual)"
    echo "Go to: https://developers.facebook.com/apps/"
    echo ""
    echo "Update your app settings:"
    echo "- App Domains: admin.skinessentialsbyher.com"
    echo "- Facebook Login → Valid OAuth Redirect URIs:"
    echo "  https://admin.skinessentialsbyher.com/api/auth/facebook"
    echo "- Webhooks → Callback URL:"
    echo "  https://admin.skinessentialsbyher.com/api/webhooks/facebook"
    echo ""
    
    # Final Instructions
    echo "📋 FINAL STEP: Start the Tunnel"
    echo "Run: cloudflared tunnel run skin-essentials-admin"
    echo ""
    echo "🎉 Setup Complete!"
    echo "Your admin dashboard will be available at:"
    echo "https://admin.skinessentialsbyher.com/admin"
    echo ""
    echo "Test URLs:"
    echo "- Webhook: https://admin.skinessentialsbyher.com/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3&hub.challenge=TEST123"
    echo "- OAuth: https://admin.skinessentialsbyher.com/api/auth/facebook"
    
else
    echo "⚠️  Tunnel UUID not provided. Setup incomplete."
    echo "Please complete authentication and tunnel creation first."
fi