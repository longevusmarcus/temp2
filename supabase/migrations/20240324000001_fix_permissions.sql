-- Fix permissions for tables that are having access issues

-- Enable row level security on tables if not already enabled
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS polar_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS webhook_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow service role full access to projects" ON projects;
DROP POLICY IF EXISTS "Allow service role full access to polar_checkouts" ON polar_checkouts;
DROP POLICY IF EXISTS "Allow service role full access to customers" ON customers;
DROP POLICY IF EXISTS "Allow service role full access to webhook_logs" ON webhook_logs;

-- Create policies that allow the service role to do everything
CREATE POLICY "Allow service role full access to projects"
  ON projects
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to polar_checkouts"
  ON polar_checkouts
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to customers"
  ON customers
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to webhook_logs"
  ON webhook_logs
  USING (auth.role() = 'service_role');

-- Grant all privileges to authenticated users (for testing purposes)
GRANT ALL ON projects TO authenticated;
GRANT ALL ON polar_checkouts TO authenticated;
GRANT ALL ON customers TO authenticated;
GRANT ALL ON webhook_logs TO authenticated;

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE polar_checkouts;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE webhook_logs;