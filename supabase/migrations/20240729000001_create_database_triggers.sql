-- Create function to automatically create or update customer records
CREATE OR REPLACE FUNCTION create_or_update_customer()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if customer with this email already exists
  IF EXISTS (SELECT 1 FROM customers WHERE email = NEW.email) THEN
    -- Update the existing customer record
    UPDATE customers
    SET updated_at = NOW()
    WHERE email = NEW.email;
    
    -- Get the customer ID to use in the NEW record
    SELECT id INTO NEW.customer_id FROM customers WHERE email = NEW.email;
  ELSE
    -- Insert a new customer record
    WITH new_customer AS (
      INSERT INTO customers (email, name)
      VALUES (NEW.email, COALESCE(NEW.developer_name, 'Unknown'))
      RETURNING id
    )
    SELECT id INTO NEW.customer_id FROM new_customer;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for polar_checkouts table
DROP TRIGGER IF EXISTS before_insert_polar_checkout ON polar_checkouts;
CREATE TRIGGER before_insert_polar_checkout
  BEFORE INSERT ON polar_checkouts
  FOR EACH ROW
  EXECUTE FUNCTION create_or_update_customer();

-- Create function to link projects to customers
CREATE OR REPLACE FUNCTION link_project_to_customer()
RETURNS TRIGGER AS $$
BEGIN
  -- If email is provided but customer_id is not, try to find or create customer
  IF NEW.email IS NOT NULL AND NEW.customer_id IS NULL THEN
    -- Check if customer with this email already exists
    IF EXISTS (SELECT 1 FROM customers WHERE email = NEW.email) THEN
      -- Get the customer ID to use in the NEW record
      SELECT id INTO NEW.customer_id FROM customers WHERE email = NEW.email;
    ELSE
      -- Insert a new customer record
      WITH new_customer AS (
        INSERT INTO customers (email, name)
        VALUES (NEW.email, NEW.developer_name)
        RETURNING id
      )
      SELECT id INTO NEW.customer_id FROM new_customer;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for projects table
DROP TRIGGER IF EXISTS before_insert_project ON projects;
CREATE TRIGGER before_insert_project
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION link_project_to_customer();

-- Create function to update project timestamps
CREATE OR REPLACE FUNCTION update_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column to projects if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'projects' AND column_name = 'updated_at') THEN
    ALTER TABLE projects ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END$$;

-- Create trigger for updating project timestamps
DROP TRIGGER IF EXISTS before_update_project ON projects;
CREATE TRIGGER before_update_project
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_timestamp();

-- Create function to log webhook events
CREATE OR REPLACE FUNCTION log_webhook_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO webhook_logs (event_type, table_name, record_id, data)
  VALUES ('INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create webhook_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for logging polar_checkouts events
DROP TRIGGER IF EXISTS after_insert_polar_checkout_log ON polar_checkouts;
CREATE TRIGGER after_insert_polar_checkout_log
  AFTER INSERT ON polar_checkouts
  FOR EACH ROW
  EXECUTE FUNCTION log_webhook_event();

-- Enable realtime for webhook_logs (only if not already added)
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'webhook_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE webhook_logs;
  END IF;
END$;
