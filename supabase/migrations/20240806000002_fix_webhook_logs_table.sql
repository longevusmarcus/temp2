-- Drop the webhook_logs table if it exists and recreate it with the correct structure
DROP TABLE IF EXISTS webhook_logs;

CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  event_type TEXT,
  payload JSONB,
  status TEXT,
  error TEXT,
  headers JSONB
);

-- Disable RLS on the webhook_logs table
ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;

-- Add the table to the realtime publication if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'webhook_logs') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE webhook_logs;
    END IF;
  END IF;
END
$$;