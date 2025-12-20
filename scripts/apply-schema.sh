#!/bin/bash

# Load environment variables
source .env.local

echo "📋 Preparing to apply schema to Supabase..."
echo "   Database: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found."
    echo ""
    echo "📝 Manual Steps Required:"
    echo "   1. Go to: https://app.supabase.com/project/plpcnscgpzknisafquwt"
    echo "   2. Click 'SQL Editor' in the left sidebar"
    echo "   3. Click 'New Query'"
    echo "   4. Copy and paste the contents of: supabase/schema.sql"
    echo "   5. Click 'Run' (or press Cmd+Enter)"
    echo ""
    echo "   The schema will create/update the following tables:"
    echo "   - service_categories"
    echo "   - services  "
    echo "   - portfolio_items"
    echo ""
    exit 1
fi

# If CLI is available, try to use it
echo "✅ Supabase CLI found"
echo "🚀 Applying schema..."

supabase db push --db-url "${NEXT_PUBLIC_SUPABASE_URL/https:/https://postgres:}@db.${NEXT_PUBLIC_SUPABASE_URL#https://}/postgres" \
  --file ./supabase/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema applied successfully!"
else
    echo "⚠️  Schema application failed via CLI"
    echo ""
    echo "📝 Please apply manually:"
    echo "   1. Go to: https://app.supabase.com/project/plpcnscgpzknisafquwt"
    echo "   2. Navigate to SQL Editor"
    echo "   3. Copy contents of supabase/schema.sql"
    echo "   4. Paste and run"
fi
