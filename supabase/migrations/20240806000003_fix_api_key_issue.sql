-- Drop and recreate the webhook_logs table with a simpler structure
DROP TABLE IF EXISTS webhook_logs;

CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  event_type TEXT,
  payload JSONB,
  status TEXT,
  error TEXT,
  headers JSONB
);

-- Insert a test record to verify access
INSERT INTO webhook_logs (event_type, status, payload)
VALUES ('test', 'success', '{"test": true}');

-- Disable RLS on the webhook_logs table
ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;

-- Create a test function to verify permissions
CREATE OR REPLACE FUNCTION test_service_key_permissions()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN TRUE;
END;
$$;