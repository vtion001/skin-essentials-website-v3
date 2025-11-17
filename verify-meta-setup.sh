#!/bin/bash

# Meta Developer Configuration Verifier
echo "🔍 Meta Developer Configuration Check"
echo "====================================="
echo ""

# Configuration
TUNNEL_URL="https://skin-essentials-admin.loca.lt"
WEBHOOK_TOKEN="fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🌐 Testing URLs with LocalTunnel: $TUNNEL_URL"
echo ""

# Function to test endpoint
test_endpoint() {
    local url=$1
    local description=$2
    local expected_response=$3
    
    echo -n "Testing $description... "
    
    if response=$(curl -s --max-time 10 "$url" 2>/dev/null); then
        if [[ -n "$expected_response" ]] && [[ "$response" == "$expected_response" ]]; then
            echo -e "${GREEN}✅ PASS${NC} (Response: $response)"
            return 0
        elif [[ -z "$expected_response" ]]; then
            echo -e "${GREEN}✅ PASS${NC} (HTTP 200)"
            return 0
        else
            echo -e "${YELLOW}⚠️  UNEXPECTED${NC} (Got: $response, Expected: $expected_response)"
            return 1
        fi
    else
        echo -e "${RED}❌ FAIL${NC} (Timeout/Connection Error)"
        return 1
    fi
}

# Test webhook endpoint
echo "1️⃣  Webhook Tests:"
test_endpoint "$TUNNEL_URL/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=$WEBHOOK_TOKEN&hub.challenge=TEST123" "Webhook Verification" "TEST123"

# Test admin endpoints
echo ""
echo "2️⃣  Admin Dashboard Tests:"
test_endpoint "$TUNNEL_URL/admin" "Admin Dashboard" ""
test_endpoint "$TUNNEL_URL/admin/login" "Admin Login Page" ""

# Test auth endpoints
echo ""
echo "3️⃣  OAuth Endpoints:"
test_endpoint "$TUNNEL_URL/api/auth/facebook" "Facebook OAuth" ""
test_endpoint "$TUNNEL_URL/api/auth/instagram" "Instagram OAuth" ""

# Test webhook endpoints
echo ""
echo "4️⃣  Webhook URLs:"
test_endpoint "$TUNNEL_URL/api/webhooks/facebook" "Facebook Webhook" ""
test_endpoint "$TUNNEL_URL/api/webhooks/instagram/deauthorize" "Instagram Deauthorize" ""
test_endpoint "$TUNNEL_URL/api/webhooks/instagram/delete" "Instagram Delete" ""

echo ""
echo "====================================="
echo "📋 Manual Steps Required:"
echo ""
echo "Go to: https://developers.facebook.com/apps/764719166731391/"
echo ""
echo "Update these settings:"
echo "1. Settings → Basic → App Domains:"
echo "   - skin-essentials-admin.loca.lt"
echo "   - localhost"
echo ""
echo "2. Facebook Login → Settings → Valid OAuth Redirect URIs:"
echo "   - https://skin-essentials-admin.loca.lt/api/auth/facebook"
echo "   - http://localhost:3001/api/auth/facebook"
echo ""
echo "3. Webhooks → Product: Page → Callback URL:"
echo "   - https://skin-essentials-admin.loca.lt/api/webhooks/facebook"
echo "   - Verify Token: $WEBHOOK_TOKEN"
echo ""
echo "4. Instagram → Basic Display → Valid OAuth Redirect URIs:"
echo "   - https://skin-essentials-admin.loca.lt/api/auth/instagram"
echo "   - http://localhost:3001/api/auth/instagram"
echo ""
echo "5. Instagram → Webhooks → Deauthorize Callback:"
echo "   - https://skin-essentials-admin.loca.lt/api/webhooks/instagram/deauthorize"
echo ""
echo "====================================="
echo "🧪 After updating, test with:"
echo "./simple-monitor.sh"
echo ""
echo "🌐 Access admin at:"
echo "https://skin-essentials-admin.loca.lt/admin"
echo ""
echo "If any tests fail above, check:"
echo "- Tunnel is running: ./simple-monitor.sh"
echo "- Dev server is running: npm run dev"
echo "- URLs are correctly copied to Meta Developer"