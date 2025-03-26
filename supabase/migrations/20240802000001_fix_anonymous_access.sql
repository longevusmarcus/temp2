-- Fix permissions for tables that are having access issues with anonymous access

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous access to projects" ON projects;
DROP POLICY IF EXISTS "Allow anonymous access to polar_checkouts" ON polar_checkouts;
DROP POLICY IF EXISTS "Allow anonymous access to customers" ON customers;
DROP POLICY IF EXISTS "Allow anonymous access to webhook_logs" ON webhook_logs;

-- Create policies that allow anonymous access for SELECT operations
CREATE POLICY "Allow anonymous access to projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous access to polar_checkouts"
  ON polar_checkouts FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous access to customers"
  ON customers FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous access to webhook_logs"
  ON webhook_logs FOR SELECT
  USING (true);

-- Grant usage on schema to anon role
GRANT USAGE ON SCHEMA public TO anon;

-- Grant select permissions to anon role
GRANT SELECT ON projects TO anon;
GRANT SELECT ON polar_checkouts TO anon;
GRANT SELECT ON customers TO anon;
GRANT SELECT ON webhook_logs TO anon;
