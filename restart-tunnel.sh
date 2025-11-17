#!/bin/bash

# Quick Tunnel Restart Script
echo "🔄 Restarting LocalTunnel..."

# Kill existing processes
pkill -f "localtunnel" 2>/dev/null || true
echo "✅ Stopped existing tunnel"

# Wait a moment
sleep 2

# Start new tunnel
echo "🚀 Starting new tunnel..."
npx --yes localtunnel --port 3001 --subdomain skin-essentials-admin &

# Wait for startup
sleep 3

echo "✅ Tunnel restart complete!"
echo "URL: https://skin-essentials-admin.loca.lt"
echo ""
echo "Run ./check-tunnel.sh to verify it's working"