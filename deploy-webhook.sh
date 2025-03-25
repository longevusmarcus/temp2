#!/bin/bash

# Check if required environment variables are set
if [ -z "$VITE_SUPABASE_PROJECT_ID" ] || [ -z "$VITE_SUPABASE_SERVICE_KEY" ]; then
  echo "Error: Missing required environment variables: VITE_SUPABASE_PROJECT_ID or VITE_SUPABASE_SERVICE_KEY"
  exit 1
fi

# Read the webhook code and encode it to base64
WEBHOOK_CODE=$(cat ./supabase/functions/polar-webhook/index.ts | base64)

# Create JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
  "name": "polar-webhook",
  "verify_jwt": false,
  "import_map": {},
  "entrypoint_path": "index.ts",
  "content": "$WEBHOOK_CODE",
  "env_vars": {
    "SUPABASE_URL": "$VITE_SUPABASE_URL",
    "SUPABASE_SERVICE_KEY": "$VITE_SUPABASE_SERVICE_KEY",
    "VITE_SUPABASE_URL": "$VITE_SUPABASE_URL",
    "VITE_SUPABASE_SERVICE_KEY": "$VITE_SUPABASE_SERVICE_KEY"
  }
}
EOF
)

# Deploy the webhook using curl
echo "Deploying polar-webhook to Supabase..."
RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VITE_SUPABASE_SERVICE_KEY" \
  -d "$JSON_PAYLOAD" \
  "https://api.supabase.com/v1/projects/$VITE_SUPABASE_PROJECT_ID/functions")

# Check if deployment was successful
if [[ $RESPONSE == *""* ]]; then
  echo "Deployment successful!"
  echo "Webhook URL: https://$VITE_SUPABASE_PROJECT_ID.supabase.co/functions/v1/polar-webhook"
else
  echo "Deployment failed. Response:"
  echo "$RESPONSE"
fi
