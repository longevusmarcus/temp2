#!/bin/bash

# Check if required environment variables are set
if [ -z "$VITE_SUPABASE_PROJECT_ID" ] || [ -z "$VITE_SUPABASE_SERVICE_KEY" ]; then
  echo "Error: Missing required environment variables: VITE_SUPABASE_PROJECT_ID or VITE_SUPABASE_SERVICE_KEY"
  exit 1
fi

# Read the webhook code
WEBHOOK_CODE=$(cat ./supabase/functions/polar-webhook/index.ts)

# Base64 encode the webhook code
ENCODED_CODE=$(echo -n "$WEBHOOK_CODE" | base64)

# Create JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
  "name": "polar-webhook",
  "verify_jwt": false,
  "import_map": {},
  "entrypoint_path": "index.ts",
  "content": "$ENCODED_CODE",
  "env_vars": {
    "SUPABASE_URL": "$VITE_SUPABASE_URL",
    "SUPABASE_SERVICE_KEY": "$VITE_SUPABASE_SERVICE_KEY",
    "VITE_SUPABASE_URL": "$VITE_SUPABASE_URL",
    "VITE_SUPABASE_SERVICE_KEY": "$VITE_SUPABASE_SERVICE_KEY"
  }
}
EOF
)

# Deploy using curl
echo "Deploying polar-webhook to Supabase..."
curl -v -X POST "https://api.supabase.com/v1/projects/$VITE_SUPABASE_PROJECT_ID/functions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VITE_SUPABASE_SERVICE_KEY" \
  -d "$JSON_PAYLOAD"

if [ $? -eq 0 ]; then
  echo "Deployment request sent successfully!"
  echo "Webhook URL: https://$VITE_SUPABASE_PROJECT_ID.supabase.co/functions/v1/polar-webhook"
else
  echo "Deployment request failed."
fi
