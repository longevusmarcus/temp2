#!/bin/bash

# Get the Supabase project ID from environment variable
PROJECT_ID=${VITE_SUPABASE_PROJECT_ID}

# Construct the webhook URL without trailing slash
WEBHOOK_URL="https://${PROJECT_ID}.supabase.co/functions/v1/polar-webhook"

# Create a test payload
TEST_PAYLOAD='{"type":"checkout.completed","data":{"checkout_id":"test_checkout_123","status":"completed","metadata":{"projectName":"Test Project","developerName":"Test Developer","locations":"[{\"x\":100,\"y\":100}]","blockSize":"medium"}}'

echo "Testing webhook at: ${WEBHOOK_URL}"
echo "Sending payload: ${TEST_PAYLOAD}"

# Execute the curl command
curl -v -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -H "webhook-signature: test_signature_123" \
  -d "${TEST_PAYLOAD}"

echo ""
echo "Test completed."
