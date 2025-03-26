-- Drop and recreate webhook_logs with minimal structure
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

-- Create a simple projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  project_name TEXT NOT NULL,
  developer_name TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL
);

-- Insert a test record
INSERT INTO projects (project_name, developer_name, width, height, x, y)
VALUES ('Test Project', 'Test Developer', 100, 100, 0, 0);

-- Disable RLS
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Grant all privileges to anon role
GRANT ALL PRIVILEGES ON TABLE webhook_logs TO anon;
GRANT ALL PRIVILEGES ON TABLE projects TO anon;