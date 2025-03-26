-- Create webhook_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  event_type TEXT,
  payload JSONB,
  status TEXT,
  error_message TEXT
);

-- Disable RLS on webhook_logs
ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;

-- Grant all privileges to anon role
GRANT ALL ON TABLE webhook_logs TO anon;
GRANT ALL ON TABLE webhook_logs TO authenticated;
GRANT ALL ON TABLE webhook_logs TO service_role;

-- Create test_api_key function
CREATE OR REPLACE FUNCTION test_api_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'API key is valid';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION test_api_key() TO anon;
GRANT EXECUTE ON FUNCTION test_api_key() TO authenticated;
GRANT EXECUTE ON FUNCTION test_api_key() TO service_role;

-- Add webhook_logs to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'webhook_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE webhook_logs;
  END IF;
END
$$;