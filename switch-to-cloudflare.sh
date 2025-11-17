#!/bin/bash

# Cloudflare Tunnel Environment Switcher
# Usage: ./switch-to-cloudflare.sh

echo "🚀 Switching from ngrok to Cloudflare Tunnel..."

# Backup current .env.local
cp .env.local .env.local.ngrok.backup

# Update to Cloudflare subdomain
sed -i '' 's|https://e2a25065fc8b.ngrok-free.app|https://admin.skinessentialsbyher.com|g' .env.local

echo "✅ Environment variables updated to use Cloudflare Tunnel"
echo "📋 Updated URLs:"
echo "   - NEXT_PUBLIC_BASE_URL: https://admin.skinessentialsbyher.com"
echo "   - FACEBOOK_REDIRECT_URI: https://admin.skinessentialsbyher.com/api/auth/facebook"
echo "   - INSTAGRAM_REDIRECT_URI: https://admin.skinessentialsbyher.com/api/auth/instagram"
echo "   - Webhook URLs: https://admin.skinessentialsbyher.com/api/webhooks/*"

echo ""
echo "⚠️  Remember to:"
echo "   1. Complete browser authentication first"
echo "   2. Create and start the Cloudflare tunnel"
echo "   3. Update Meta Developer settings with new domain"
echo "   4. Set up Cloudflare Access bypass rules"
echo ""
echo "To revert back to ngrok, run: cp .env.local.ngrok.backup .env.local"