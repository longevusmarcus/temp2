-- Create customers table to store customer information
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add customer_id to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

-- Add customer_id to polar_checkouts table
ALTER TABLE polar_checkouts ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_polar_checkouts_customer_id ON polar_checkouts(customer_id);

-- Enable realtime for customers table
alter publication supabase_realtime add table customers;