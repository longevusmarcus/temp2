-- Create webhook_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  event_type TEXT,
  payload JSONB,
  status TEXT,
  error_message TEXT
);

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  project_name TEXT,
  description TEXT,
  developer_name TEXT,
  website_url TEXT,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  x INTEGER,
  y INTEGER,
  color TEXT,
  category TEXT,
  email TEXT
);

-- Disable RLS on tables
ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Grant privileges to roles
GRANT ALL ON webhook_logs TO anon, authenticated, service_role;
GRANT ALL ON projects TO anon, authenticated, service_role;

-- Create test_api_key function
CREATE OR REPLACE FUNCTION test_api_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'API key is valid';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION test_api_key() TO anon, authenticated, service_role;

-- Add tables to realtime publication if not already members
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
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE projects;
  END IF;
END
$$;