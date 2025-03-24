-- Create a table to log webhook events for debugging
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_type TEXT,
  payload JSONB,
  headers JSONB,
  status TEXT,
  error TEXT
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS webhook_logs_created_at_idx ON webhook_logs (created_at);
