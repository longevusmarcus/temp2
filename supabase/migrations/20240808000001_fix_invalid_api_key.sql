-- Drop and recreate webhook_logs with minimal structure and proper permissions
DROP TABLE IF EXISTS webhook_logs;

CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  event_type TEXT,
  payload JSONB
);

-- Insert a test record
INSERT INTO webhook_logs (event_type, payload)
VALUES ('test', '{"message": "Test record"}');

-- Disable RLS
ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;

-- Grant ALL privileges to anon and authenticated roles
GRANT ALL ON TABLE webhook_logs TO anon;
GRANT ALL ON TABLE webhook_logs TO authenticated;
GRANT ALL ON TABLE webhook_logs TO service_role;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE webhook_logs;

-- Create a simple projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  project_name TEXT NOT NULL,
  developer_name TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  description TEXT,
  website_url TEXT,
  thumbnail_url TEXT,
  color TEXT,
  category TEXT,
  email TEXT
);

-- Insert a test record if none exists
INSERT INTO projects (project_name, developer_name, width, height, x, y)
SELECT 'Test Project', 'Test Developer', 100, 100, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM projects);

-- Disable RLS
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Grant ALL privileges to anon and authenticated roles
GRANT ALL ON TABLE projects TO anon;
GRANT ALL ON TABLE projects TO authenticated;
GRANT ALL ON TABLE projects TO service_role;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- Create a test function that can be called to verify API key permissions
CREATE OR REPLACE FUNCTION test_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 'API key is valid';
END;
$$;

-- Grant execute permission on the function to anon and authenticated roles
GRANT EXECUTE ON FUNCTION test_api_key() TO anon;
GRANT EXECUTE ON FUNCTION test_api_key() TO authenticated;
GRANT EXECUTE ON FUNCTION test_api_key() TO service_role;