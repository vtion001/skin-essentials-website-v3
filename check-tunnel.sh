#!/bin/bash

# Quick Tunnel Health Check
# Simple script to check if tunnel is working

echo "🔍 Quick Tunnel Health Check"
echo "=========================="

# Test webhook endpoint
echo "Testing webhook endpoint..."
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" --max-time 10 "https://skin-essentials-admin.loca.lt/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3&hub.challenge=TEST123" 2>/dev/null || echo "HTTP_CODE:000")

http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
challenge=$(echo "$response" | grep -v "HTTP_CODE:" | tr -d '\n')

if [[ "$http_code" == "200" ]] && [[ "$challenge" == "TEST123" ]]; then
    echo "✅ Webhook endpoint: WORKING"
else
    echo "❌ Webhook endpoint: FAILED (HTTP: $http_code, Response: $challenge)"
fi

# Test admin login page
echo ""
echo "Testing admin dashboard..."
admin_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" --max-time 15 "https://skin-essentials-admin.loca.lt/admin/login" 2>/dev/null || echo "HTTP_CODE:000")
admin_code=$(echo "$admin_response" | grep "HTTP_CODE:" | cut -d: -f2)

if [[ "$admin_code" == "200" ]] || [[ "$admin_code" == "302" ]]; then
    echo "✅ Admin dashboard: ACCESSIBLE"
elif [[ "$admin_code" == "000" ]]; then
    echo "❌ Admin dashboard: TIMEOUT (tunnel may be down)"
elif [[ "$admin_code" == "504" ]]; then
    echo "⚠️  Admin dashboard: GATEWAY TIMEOUT (tunnel overloaded)"
else
    echo "⚠️  Admin dashboard: HTTP $admin_code"
fi

# Check local dev server
echo ""
echo "Testing local dev server..."
local_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" --max-time 5 "http://localhost:3001/admin" 2>/dev/null || echo "HTTP_CODE:000")
local_code=$(echo "$local_response" | grep "HTTP_CODE:" | cut -d: -f2)

if [[ "$local_code" == "200" ]] || [[ "$local_code" == "302" ]]; then
    echo "✅ Local dev server: RUNNING"
else
    echo "❌ Local dev server: NOT RESPONDING"
fi

echo ""
echo "=========================="
echo "📝 Summary:"
echo "- Tunnel URL: https://skin-essentials-admin.loca.lt"
echo "- Local Server: http://localhost:3001"
echo "- If tunnel fails, restart with: ./restart-tunnel.sh"
echo "- For monitoring: ./monitor-tunnel.sh"