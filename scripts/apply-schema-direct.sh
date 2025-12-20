#!/bin/bash

# Load environment variables manually to avoid dependency issues
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_ROLE_KEY" ]; then
  echo "❌ Missing Supabase credentials in .env.local"
  exit 1
fi

echo "📋 Reading schema.sql..."
SCHEMA_CONTENT=$(cat supabase/schema.sql)

echo "🚀 Applying schema to Supabase..."
echo "   Database: $SUPABASE_URL"

# Encode the schema content for JSON
JSON_QUERY=$(jq -n --arg q "$SCHEMA_CONTENT" '{query: $q}')

# Try to use the exec_sql RPC if it exists
RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -d "$JSON_QUERY")

if [[ $RESPONSE == *"error"* ]] || [[ $RESPONSE == *"message"* ]]; then
  echo "⚠️  RPC method failed or returned error."
  echo "Detailed response: $RESPONSE"
  echo ""
  echo "📝 Please apply manually via Supabase Dashboard:"
  echo "   1. Go to: https://app.supabase.com/project/$(echo $SUPABASE_URL | cut -d'/' -f3 | cut -d'.' -f1)"
  echo "   2. Nav to 'SQL Editor'"
  echo "   3. Paste contents of supabase/schema.sql"
  echo "   4. Run"
else
  echo "✅ Schema applied successfully!"
fi
