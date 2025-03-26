-- Create webhook_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  event_type TEXT,
  payload JSONB,
  status TEXT,
  error TEXT,
  headers JSONB
);

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  project_name TEXT NOT NULL,
  developer_name TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  thumbnail_url TEXT,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  color TEXT,
  category TEXT,
  email TEXT
);

-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  email TEXT,
  polar_customer_id TEXT
);

-- Create polar_checkouts table if it doesn't exist
CREATE TABLE IF NOT EXISTS polar_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  checkout_id TEXT NOT NULL,
  email TEXT,
  status TEXT,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Create user_purchases table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID,
  project_id UUID REFERENCES projects(id),
  checkout_id TEXT REFERENCES polar_checkouts(checkout_id),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending'
);

-- Disable RLS on all tables
ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE polar_checkouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases DISABLE ROW LEVEL SECURITY;

-- Add tables to realtime publication
DO $$
BEGIN
  -- Check if the publication exists
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Add tables to the publication if they're not already members
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'webhook_logs') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE webhook_logs;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'projects') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE projects;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'customers') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE customers;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'polar_checkouts') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE polar_checkouts;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'user_purchases') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE user_purchases;
    END IF;
  END IF;
END
$$;