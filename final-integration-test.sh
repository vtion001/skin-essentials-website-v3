#!/bin/bash

# Final Meta Developer Integration Test
echo "🧪 Final Integration Test"
echo "======================="
echo ""

# Configuration
TUNNEL_URL="https://skin-essentials-admin.loca.lt"
WEBHOOK_TOKEN="fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3"

# Test results
declare -a tests_passed=()
declare -a tests_failed=()

# Function to run test
run_test() {
    local name=$1
    local command=$2
    local expected=$3
    
    echo -n "Testing: $name... "
    
    if result=$(eval "$command" 2>/dev/null); then
        if [[ -n "$expected" ]] && [[ "$result" == "$expected" ]]; then
            echo "✅ PASS"
            tests_passed+=("$name")
        elif [[ -z "$expected" ]] && [[ "$result" != "" ]]; then
            echo "✅ PASS"
            tests_passed+=("$name")
        else
            echo "❌ FAIL (Got: $result, Expected: $expected)"
            tests_failed+=("$name")
        fi
    else
        echo "❌ FAIL (Connection Error)"
        tests_failed+=("$name")
    fi
}

echo "1️⃣  Infrastructure Tests:"
run_test "Tunnel Health" "curl -s -f '$TUNNEL_URL/admin' && echo 'OK'" "OK"
run_test "Local Dev Server" "curl -s -f 'http://localhost:3001/admin' && echo 'OK'" "OK"

echo ""
echo "2️⃣  API Endpoint Tests:"
run_test "Webhook Verification" "curl -s '$TUNNEL_URL/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=$WEBHOOK_TOKEN&hub.challenge=TEST123'" "TEST123"
run_test "Facebook OAuth Endpoint" "curl -s -f '$TUNNEL_URL/api/auth/facebook' && echo 'OK'" "OK"
run_test "Instagram OAuth Endpoint" "curl -s -f '$TUNNEL_URL/api/auth/instagram' && echo 'OK'" "OK"

echo ""
echo "3️⃣  Admin Dashboard Tests:"
run_test "Admin Dashboard" "curl -s -f '$TUNNEL_URL/admin' && echo 'OK'" "OK"
run_test "Admin Login Page" "curl -s -f '$TUNNEL_URL/admin/login' && echo 'OK'" "OK"

echo ""
echo "4️⃣  Webhook URL Tests:"
run_test "Facebook Webhook" "curl -s -f '$TUNNEL_URL/api/webhooks/facebook' && echo 'OK'" "OK"
run_test "Instagram Deauthorize" "curl -s -f '$TUNNEL_URL/api/webhooks/instagram/deauthorize' && echo 'OK'" "OK"
run_test "Instagram Delete" "curl -s -f '$TUNNEL_URL/api/webhooks/instagram/delete' && echo 'OK'" "OK"

echo ""
echo "======================="
echo "📊 Test Results Summary:"
echo "✅ Passed: ${#tests_passed[@]}"
echo "❌ Failed: ${#tests_failed[@]}"
echo ""

if [[ ${#tests_failed[@]} -eq 0 ]]; then
    echo "🎉 ALL TESTS PASSED!"
    echo ""
    echo "✅ Your setup is ready for Facebook/Instagram integration!"
    echo "🌐 Access admin: $TUNNEL_URL/admin"
    echo ""
    echo "Next steps:"
    echo "1. Update Meta Developer settings (see meta-developer-checklist.md)"
    echo "2. Test Facebook OAuth flow"
    echo "3. Test message synchronization"
else
    echo "⚠️  SOME TESTS FAILED:"
    for test in "${tests_failed[@]}"; do
        echo "  - $test"
    done
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Check tunnel: ./simple-monitor.sh"
    echo "2. Restart tunnel: ./restart-tunnel.sh"
    echo "3. Check dev server: npm run dev"
    echo "4. Verify Meta Developer settings"
fi

echo ""
echo "📋 To run this test again:"
echo "./final-integration-test.sh"