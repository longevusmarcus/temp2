-- Fix permissions for webhook_logs table to allow anonymous inserts

-- Make sure RLS is enabled
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous insert to webhook_logs" ON webhook_logs;

-- Create policy that allows anonymous inserts
CREATE POLICY "Allow anonymous insert to webhook_logs"
  ON webhook_logs FOR INSERT
  WITH CHECK (true);

-- Enable realtime for webhook_logs table
ALTER PUBLICATION supabase_realtime ADD TABLE webhook_logs;
