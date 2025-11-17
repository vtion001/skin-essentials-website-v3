#!/bin/bash

# Quick LocalTunnel Setup Script
# Alternative to ngrok for stable testing

echo "🚀 Setting up LocalTunnel as alternative..."

# Install LocalTunnel globally if not present
if ! command -v lt &> /dev/null; then
    echo "📦 Installing LocalTunnel..."
    npm install -g localtunnel
fi

# Start LocalTunnel with your subdomain
echo "🌐 Starting LocalTunnel on port 3001..."
echo "This will give you a stable subdomain for testing"

# Kill any existing lt processes
pkill -f "lt --port 3001" 2>/dev/null || true

# Start LocalTunnel with stable subdomain
lt --port 3001 --subdomain skin-essentials-admin

echo "✅ LocalTunnel started!"
echo "Your URL should be: https://skin-essentials-admin.loca.lt"
echo "Update your Meta Developer settings with this URL"