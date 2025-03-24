-- Create a table to store Polar.sh checkout sessions
CREATE TABLE IF NOT EXISTS polar_checkouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkout_id TEXT NOT NULL UNIQUE,
  email TEXT,
  metadata JSONB,
  status TEXT DEFAULT 'pending',
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable row level security
ALTER TABLE polar_checkouts ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
DROP POLICY IF EXISTS "Admin can do everything" ON polar_checkouts;
CREATE POLICY "Admin can do everything"
  ON polar_checkouts
  USING (auth.role() = 'authenticated');

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE polar_checkouts;
