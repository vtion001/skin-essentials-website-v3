#!/bin/bash

# Simple Tunnel Monitor - Easy to Use
echo "🔍 Simple Tunnel Monitor"
echo "======================="

# Test admin dashboard (most important for you)
echo "1. Testing Admin Dashboard..."
if curl -s -f "https://skin-essentials-admin.loca.lt/admin" > /dev/null; then
    echo "✅ Admin dashboard is ACCESSIBLE"
else
    echo "❌ Admin dashboard is NOT accessible"
fi

# Test webhook endpoint
echo ""
echo "2. Testing Webhook Endpoint..."
response=$(curl -s "https://skin-essentials-admin.loca.lt/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3&hub.challenge=TEST123" 2>/dev/null || echo "FAILED")

if [[ "$response" == "TEST123" ]]; then
    echo "✅ Webhook endpoint is WORKING"
else
    echo "❌ Webhook endpoint is NOT working"
fi

# Test local server
echo ""
echo "3. Testing Local Dev Server..."
if curl -s -f "http://localhost:3001/admin" > /dev/null; then
    echo "✅ Local dev server is RUNNING"
else
    echo "❌ Local dev server is NOT running"
fi

echo ""
echo "======================="
echo "📝 Quick Actions:"
echo "- If tunnel fails: ./restart-tunnel.sh"
echo "- Check again: ./simple-monitor.sh"
echo "- Access admin: https://skin-essentials-admin.loca.lt/admin"
echo ""
echo "⚠️  Note: LocalTunnel can be slow during peak hours"
echo "   If consistently slow, consider upgrading to paid service"