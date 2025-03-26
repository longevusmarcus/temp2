-- Create a test project if none exists
INSERT INTO projects (id, project_name, developer_name, description, website_url, thumbnail_url, x, y, width, height, category, email)
SELECT 
  gen_random_uuid(), 
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

-- Make sure the webhook_logs table exists
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  event_type TEXT,
  payload JSONB,
  status TEXT,
  error_message TEXT
);

-- Make sure the polar_checkouts table exists
CREATE TABLE IF NOT EXISTS polar_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  email TEXT,
  status TEXT,
  metadata JSONB,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Add the tables to the realtime publication if they're not already there
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
