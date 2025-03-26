-- Fix service role access to ensure proper saving functionality

-- Ensure the service role has all necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Make sure RLS doesn't block service role
ALTER TABLE projects FORCE ROW LEVEL SECURITY;
ALTER TABLE polar_checkouts FORCE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs FORCE ROW LEVEL SECURITY;

-- Create bypass policy for service_role
DROP POLICY IF EXISTS "Service role bypass for projects" ON projects;
DROP POLICY IF EXISTS "Service role bypass for polar_checkouts" ON polar_checkouts;
DROP POLICY IF EXISTS "Service role bypass for customers" ON customers;
DROP POLICY IF EXISTS "Service role bypass for webhook_logs" ON webhook_logs;

CREATE POLICY "Service role bypass for projects"
  ON projects
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass for polar_checkouts"
  ON polar_checkouts
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass for customers"
  ON customers
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role bypass for webhook_logs"
  ON webhook_logs
  USING (auth.role() = 'service_role');
