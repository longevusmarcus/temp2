-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_name TEXT,
  developer_name TEXT,
  description TEXT,
  website_url TEXT,
  x INTEGER,
  y INTEGER,
  width INTEGER,
  height INTEGER,
  color TEXT,
  category TEXT
);

CREATE TABLE IF NOT EXISTS polar_checkouts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkout_id TEXT,
  email TEXT,
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  webhook_data JSONB,
  processed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Disable RLS for these tables to ensure the tests can access them
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE polar_checkouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Enable realtime for these tables (only if not already added)
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  -- Check and add projects table
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'projects'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE projects;
  END IF;
  
  -- Check and add polar_checkouts table
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'polar_checkouts'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE polar_checkouts;
  END IF;
  
  -- Check and add webhook_logs table
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'webhook_logs'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE webhook_logs;
  END IF;
  
  -- Check and add customers table
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'customers'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE customers;
  END IF;
END
$$;