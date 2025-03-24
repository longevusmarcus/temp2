-- Add email column to customers table if it doesn't exist
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;

-- Add email column to projects table if it doesn't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index on customers.email for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Create index on projects.email for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_email ON projects(email);

-- Add the tables to the realtime publication if they're not already part of it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'customers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE customers;
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
