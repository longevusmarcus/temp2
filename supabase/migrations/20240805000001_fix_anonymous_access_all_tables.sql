-- Fix permissions to allow anonymous access to all tables

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE polar_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous select from projects" ON projects;
DROP POLICY IF EXISTS "Allow anonymous insert to projects" ON projects;
DROP POLICY IF EXISTS "Allow anonymous update to projects" ON projects;
DROP POLICY IF EXISTS "Allow anonymous delete from projects" ON projects;

DROP POLICY IF EXISTS "Allow anonymous select from polar_checkouts" ON polar_checkouts;
DROP POLICY IF EXISTS "Allow anonymous insert to polar_checkouts" ON polar_checkouts;
DROP POLICY IF EXISTS "Allow anonymous update to polar_checkouts" ON polar_checkouts;
DROP POLICY IF EXISTS "Allow anonymous delete from polar_checkouts" ON polar_checkouts;

DROP POLICY IF EXISTS "Allow anonymous select from customers" ON customers;
DROP POLICY IF EXISTS "Allow anonymous insert to customers" ON customers;
DROP POLICY IF EXISTS "Allow anonymous update to customers" ON customers;
DROP POLICY IF EXISTS "Allow anonymous delete from customers" ON customers;

DROP POLICY IF EXISTS "Allow anonymous select from webhook_logs" ON webhook_logs;
DROP POLICY IF EXISTS "Allow anonymous insert to webhook_logs" ON webhook_logs;
DROP POLICY IF EXISTS "Allow anonymous update to webhook_logs" ON webhook_logs;
DROP POLICY IF EXISTS "Allow anonymous delete from webhook_logs" ON webhook_logs;

-- Create policies that allow anonymous access to all tables
-- Projects table
CREATE POLICY "Allow anonymous select from projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert to projects"
  ON projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to projects"
  ON projects FOR UPDATE
  USING (true);

CREATE POLICY "Allow anonymous delete from projects"
  ON projects FOR DELETE
  USING (true);

-- Polar checkouts table
CREATE POLICY "Allow anonymous select from polar_checkouts"
  ON polar_checkouts FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert to polar_checkouts"
  ON polar_checkouts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to polar_checkouts"
  ON polar_checkouts FOR UPDATE
  USING (true);

CREATE POLICY "Allow anonymous delete from polar_checkouts"
  ON polar_checkouts FOR DELETE
  USING (true);

-- Customers table
CREATE POLICY "Allow anonymous select from customers"
  ON customers FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert to customers"
  ON customers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to customers"
  ON customers FOR UPDATE
  USING (true);

CREATE POLICY "Allow anonymous delete from customers"
  ON customers FOR DELETE
  USING (true);

-- Webhook logs table
CREATE POLICY "Allow anonymous select from webhook_logs"
  ON webhook_logs FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert to webhook_logs"
  ON webhook_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to webhook_logs"
  ON webhook_logs FOR UPDATE
  USING (true);

CREATE POLICY "Allow anonymous delete from webhook_logs"
  ON webhook_logs FOR DELETE
  USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE polar_checkouts;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE webhook_logs;
