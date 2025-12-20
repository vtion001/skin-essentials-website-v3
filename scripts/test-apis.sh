#!/bin/bash

echo "🧪 Testing API Endpoints..."
echo ""

echo "📦 Testing Portfolio API..."
PORTFOLIO_RESULT=$(curl -s http://localhost:3001/api/portfolio)
PORTFOLIO_OK=$(echo $PORTFOLIO_RESULT | jq -r '.ok')
PORTFOLIO_COUNT=$(echo $PORTFOLIO_RESULT | jq -r '.data | length')

if [ "$PORTFOLIO_OK" = "true" ]; then
    echo "   ✅ Portfolio API: Working ($PORTFOLIO_COUNT items)"
else
    echo "   ❌ Portfolio API: Failed"
    echo "      Error: $(echo $PORTFOLIO_RESULT | jq -r '.error')"
fi

echo ""
echo "🛍️  Testing Services API..."
SERVICES_RESULT=$(curl -s http://localhost:3001/api/services)
SERVICES_OK=$(echo $SERVICES_RESULT | jq -r '.ok')
SERVICES_COUNT=$(echo $SERVICES_RESULT | jq -r '.data | length')

if [ "$SERVICES_OK" = "true" ]; then
    echo "   ✅ Services API: Working ($SERVICES_COUNT categories)"
else
    echo "   ❌ Services API: Failed"
    ERROR=$(echo $SERVICES_RESULT | jq -r '.error')
    echo "      Error: $ERROR"
    
    if [[ "$ERROR" == *"does not exist"* ]]; then
        echo ""
        echo "   ⚠️  This error means the schema hasn't been applied yet."
        echo "      Please follow the manual steps to apply supabase/schema.sql"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$PORTFOLIO_OK" = "true" ] && [ "$SERVICES_OK" = "true" ]; then
    echo "🎉 All APIs working perfectly!"
    echo ""
    echo "Next steps:"
    echo "  • Visit http://localhost:3001/portfolio"
    echo "  • Visit http://localhost:3001/services"
    echo "  • Check for hydration errors in console"
else
    echo "⚠️  Some APIs need attention (see above)"
fi
