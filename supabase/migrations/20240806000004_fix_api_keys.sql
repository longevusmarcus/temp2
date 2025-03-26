-- Create a test function to verify API key permissions
CREATE OR REPLACE FUNCTION test_api_key()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'API key is valid';
END;
$$;

-- Ensure webhook_logs table exists with correct structure
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  event_type TEXT,
  payload JSONB,
  status TEXT,
  error TEXT,
  headers JSONB
);

-- Insert a test record
INSERT INTO webhook_logs (event_type, status, payload)
VALUES ('test', 'success', '{"message": "Test record"}')
ON CONFLICT DO NOTHING;

-- Disable RLS on webhook_logs
ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for all users
DROP POLICY IF EXISTS "Allow all operations" ON webhook_logs;
CREATE POLICY "Allow all operations" ON webhook_logs
  USING (true)
  WITH CHECK (true);

-- Grant all privileges to authenticated and anon roles
GRANT ALL PRIVILEGES ON TABLE webhook_logs TO authenticated;
GRANT ALL PRIVILEGES ON TABLE webhook_logs TO anon;
GRANT ALL PRIVILEGES ON TABLE webhook_logs TO service_role;