#!/bin/bash

# Enhanced Tunnel Monitor with Performance Tracking
echo "🔍 Enhanced Tunnel Monitor"
echo "========================"

# Configuration
TUNNEL_URL="https://skin-essentials-admin.loca.lt"
LOCAL_URL="http://localhost:3001"
MAX_RESPONSE_TIME=5  # seconds
LOG_FILE="tunnel-monitor.log"

# Function to log with timestamp
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to test endpoint with detailed timing
test_endpoint() {
    local url=$1
    local name=$2
    local max_time=$3
    
    echo "Testing: $name"
    echo "URL: $url"
    
    # Detailed timing test
    response=$(curl -s -w "\nTIME:%{time_total}\nHTTP_CODE:%{http_code}\nSIZE:%{size_download}" --max-time "$max_time" "$url" 2>/dev/null || echo "TIME:999\nHTTP_CODE:000\nSIZE:0")
    
    time=$(echo "$response" | grep "TIME:" | cut -d: -f2)
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    size=$(echo "$response" | grep "SIZE:" | cut -d: -f2)
    
    echo "Response Time: ${time}s"
    echo "HTTP Code: $http_code"
    echo "Response Size: ${size} bytes"
    
    # Determine status
    if [[ "$http_code" == "000" ]]; then
        echo "❌ Status: TIMEOUT/FAILED"
        return 1
    elif [[ "$http_code" == "200" ]] || [[ "$http_code" == "302" ]] || [[ "$http_code" == "307" ]]; then
        if (( $(echo "$time > $MAX_RESPONSE_TIME" | bc -l) )); then
            echo "⚠️  Status: SLOW (>${MAX_RESPONSE_TIME}s)"
        else
            echo "✅ Status: HEALTHY"
        fi
        return 0
    else
        echo "⚠️  Status: HTTP ERROR ($http_code)"
        return 1
    fi
}

# Function to check tunnel stability
check_stability() {
    echo ""
    echo "🔄 Checking Tunnel Stability (3 tests over 30s)"
    
    success_count=0
    total_time=0
    
    for i in {1..3}; do
        echo "Test $i/3..."
        response=$(curl -s -w "\nTIME:%{time_total}" --max-time 10 "$TUNNEL_URL/admin" 2>/dev/null || echo "TIME:999")
        time=$(echo "$response" | grep "TIME:" | cut -d: -f2)
        
        if [[ "$time" != "999" ]] && (( $(echo "$time < 10" | bc -l) )); then
            success_count=$((success_count + 1))
            total_time=$(echo "$total_time + $time" | bc)
        fi
        
        if [[ $i -lt 3 ]]; then
            sleep 10
        fi
    done
    
    avg_time=$(echo "scale=2; $total_time / $success_count" | bc -l)
    stability_rate=$(echo "scale=0; $success_count * 100 / 3" | bc -l)
    
    echo "Success Rate: ${stability_rate}%"
    echo "Average Response Time: ${avg_time}s"
    
    if [[ $success_count -ge 2 ]]; then
        echo "✅ Tunnel Stability: GOOD"
    else
        echo "❌ Tunnel Stability: POOR"
    fi
}

# Function to suggest improvements
 suggest_improvements() {
    echo ""
    echo "💡 Suggestions:"
    echo "1. If tunnel is slow, try restarting it: ./restart-tunnel.sh"
    echo "2. For persistent issues, consider:"
    echo "   - Cloudflare Tunnel (requires domain setup)"
    echo "   - ngrok Pro (paid, more stable)"
    echo "   - Running locally without tunnel for development"
    echo "3. Monitor logs: tail -f tunnel-monitor.log"
    echo "4. Check LocalTunnel status: https://localtunnel.me"
}

# Main execution
echo "Starting comprehensive tunnel check..."
log_message "Starting tunnel health check"

# Test key endpoints
echo ""
test_endpoint "$TUNNEL_URL/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3&hub.challenge=TEST123" "Webhook Endpoint" 5

echo ""
test_endpoint "$TUNNEL_URL/admin" "Admin Dashboard" 10

echo ""
test_endpoint "$LOCAL_URL/admin" "Local Dev Server" 3

# Check stability
check_stability

# Suggestions
suggest_improvements

log_message "Tunnel health check completed"
echo ""
echo "📊 Full log available in: tunnel-monitor.log"