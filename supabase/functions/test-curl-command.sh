#!/bin/bash

# Get the Supabase URL from environment variables
SUPABASE_URL=${VITE_SUPABASE_URL:-""}

# Remove trailing slash if present
SUPABASE_URL=${SUPABASE_URL%/}

# Construct the webhook URL
WEBHOOK_URL="${SUPABASE_URL}/functions/v1/polar-webhook"

# Generate a test signature
TEST_SIGNATURE="test_signature_123"

# Create a test payload
TEST_PAYLOAD='{"type":"checkout.completed","data":{"checkout_id":"test_checkout_123","status":"completed","metadata":{"projectName":"Test Project","developerName":"Test Developer","locations":"[{\"x\":100,\"y\":100}]","blockSize":"medium"}}}'

# Print the command that will be executed
echo "Executing curl command to test webhook at: ${WEBHOOK_URL}"

# Execute the curl command
curl -v -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -H "webhook-signature: ${TEST_SIGNATURE}" \
  -d "${TEST_PAYLOAD}"

echo ""
echo "Test completed. Check the response above."
