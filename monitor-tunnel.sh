#!/bin/bash

# Tunnel Monitor Script
# Monitors and restarts tunnel when needed

echo "🔍 Monitoring LocalTunnel Status..."

# Function to check tunnel health
check_tunnel() {
    local url=$1
    local timeout=10
    
    echo "Checking: $url"
    
    # Test with timeout
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" --max-time $timeout "$url" 2>/dev/null || echo "HTTP_CODE:000")
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    
    if [[ "$http_code" == "200" ]] || [[ "$http_code" == "302" ]]; then
        echo "✅ Tunnel is healthy (HTTP $http_code)"
        return 0
    elif [[ "$http_code" == "000" ]]; then
        echo "❌ Tunnel timeout/no response"
        return 1
    else
        echo "⚠️  Tunnel issue (HTTP $http_code)"
        return 1
    fi
}

# Function to restart tunnel
restart_tunnel() {
    echo "🔄 Restarting LocalTunnel..."
    
    # Kill existing localtunnel processes
    pkill -f "localtunnel" 2>/dev/null || true
    sleep 2
    
    # Start new tunnel
    echo "Starting new tunnel on port 3001..."
    npx --yes localtunnel --port 3001 --subdomain skin-essentials-admin &
    
    # Wait for tunnel to establish
    sleep 5
    
    echo "✅ Tunnel restart initiated"
}

# Main monitoring loop
while true; do
    echo "$(date): Monitoring tunnel..."
    
    # Check webhook endpoint
    if check_tunnel "https://skin-essentials-admin.loca.lt/api/webhooks/facebook"; then
        echo "$(date): Webhook endpoint is working"
    else
        echo "$(date): Webhook endpoint failed - restarting tunnel"
        restart_tunnel
        sleep 10
        continue
    fi
    
    # Check admin dashboard
    if check_tunnel "https://skin-essentials-admin.loca.lt/admin"; then
        echo "$(date): Admin dashboard is accessible"
    else
        echo "$(date): Admin dashboard timeout - tunnel may be slow"
    fi
    
    # Wait before next check
    echo "$(date): Sleeping for 60 seconds..."
    sleep 60
done