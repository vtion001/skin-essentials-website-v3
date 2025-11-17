#!/bin/bash

# Simple Meta Developer Setup Verification
echo "🔍 Meta Developer Setup Verification"
echo "===================================="
echo ""

TUNNEL_URL="https://skin-essentials-admin.loca.lt"

echo "🌐 Testing LocalTunnel URL: $TUNNEL_URL"
echo ""

# Test 1: Basic connectivity
echo "1️⃣  Basic Connectivity Tests:"
echo -n "   Admin Dashboard: "
if curl -s -f "$TUNNEL_URL/admin" > /dev/null; then
    echo "✅ Accessible"
else
    echo "❌ Not accessible"
fi

echo -n "   Webhook Endpoint: "
if curl -s -f "$TUNNEL_URL/api/webhooks/facebook" > /dev/null; then
    echo "✅ Accessible"
else
    echo "❌ Not accessible"
fi

echo -n "   OAuth Endpoint: "
if curl -s -f "$TUNNEL_URL/api/auth/facebook" > /dev/null; then
    echo "✅ Accessible"
else
    echo "❌ Not accessible"
fi

# Test 2: Webhook verification
echo ""
echo "2️⃣  Webhook Verification Test:"
response=$(curl -s "$TUNNEL_URL/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3&hub.challenge=TEST123" 2>/dev/null)
if [[ "$response" == "TEST123" ]]; then
    echo "   ✅ Webhook verification working"
else
    echo "   ❌ Webhook verification failed"
    echo "   Response: $response"
fi

# Test 3: Local dev server
echo ""
echo "3️⃣  Local Dev Server Test:"
echo -n "   Local admin: "
if curl -s -f "http://localhost:3001/admin" > /dev/null; then
    echo "✅ Running"
else
    echo "❌ Not running"
fi

echo ""
echo "====================================="
echo "📋 Meta Developer Manual Setup Steps:"
echo ""
echo "Go to: https://developers.facebook.com/apps/764719166731391/"
echo ""
echo "1. Settings → Basic → App Domains:"
echo "   Add: skin-essentials-admin.loca.lt"
echo "   Add: localhost"
echo ""
echo "2. Facebook Login → Settings → Valid OAuth Redirect URIs:"
echo "   Add: https://skin-essentials-admin.loca.lt/api/auth/facebook"
echo "   Add: http://localhost:3001/api/auth/facebook"
echo ""
echo "3. Webhooks → Product: Page → Callback URL:"
echo "   URL: https://skin-essentials-admin.loca.lt/api/webhooks/facebook"
echo "   Verify Token: fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3"
echo ""
echo "4. Instagram → Basic Display → Valid OAuth Redirect URIs:"
echo "   Add: https://skin-essentials-admin.loca.lt/api/auth/instagram"
echo "   Add: http://localhost:3001/api/auth/instagram"
echo ""
echo "5. Instagram → Webhooks → Deauthorize Callback:"
echo "   URL: https://skin-essentials-admin.loca.lt/api/webhooks/instagram/deauthorize"
echo ""
echo "====================================="
echo "🎯 After updating Meta Developer:"
echo "1. Test OAuth: https://skin-essentials-admin.loca.lt/admin"
echo "2. Click 'Connect Facebook Account'"
echo "3. Test messaging: Send message to your page"
echo "4. Check conversations in admin dashboard"
echo ""
echo "🔧 If issues occur:"
echo "- Run: ./simple-monitor.sh"
echo "- Restart tunnel: ./restart-tunnel.sh"
echo "- Check this guide: meta-developer-setup-guide.md"