-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  project_name TEXT NOT NULL,
  developer_name TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  thumbnail_url TEXT,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  color TEXT,
  category TEXT,
  email TEXT
);

-- Create webhook_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  event_type TEXT,
  payload JSONB,
  status TEXT,
  error_message TEXT
);

-- Disable RLS on projects table
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Disable RLS on webhook_logs table
ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;

-- Add tables to realtime publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- Insert a test project if none exists
INSERT INTO projects (project_name, developer_name, description, website_url, thumbnail_url, x, y, width, height, category, email)
SELECT 
  'Test Project', 
  'Test Developer', 
  'This is a test project to verify the database connection is working properly.', 
  'https://example.com', 
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80', 
  100, 
  100, 
  50, 
  50, 
  'Web App', 
  'test@example.com'
WHERE NOT EXISTS (SELECT 1 FROM projects LIMIT 1);
