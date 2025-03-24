-- Function to test insert permissions without actually inserting data
CREATE OR REPLACE FUNCTION test_insert_permission(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function tests if the current user has permission to insert
  -- into the specified table without actually inserting anything
  
  -- For projects table
  IF table_name = 'projects' THEN
    -- Start a transaction
    BEGIN
      -- Try to insert a test record
      INSERT INTO projects 
        (project_name, developer_name, description, website_url, x, y, width, height, color, category)
      VALUES 
        ('TEST_PERMISSION', 'TEST_USER', 'Test record', 'http://example.com', 0, 0, 1, 1, '#000000', 'test')
      RETURNING id;
      -- Roll back the transaction
      ROLLBACK;
      RETURN TRUE;
    EXCEPTION WHEN OTHERS THEN
      -- Roll back the transaction
      ROLLBACK;
      RETURN FALSE;
    END;
  END IF;
  
  -- For polar_checkouts table
  IF table_name = 'polar_checkouts' THEN
    -- Start a transaction
    BEGIN
      -- Try to insert a test record
      INSERT INTO polar_checkouts 
        (checkout_id, email, status, metadata, created_at)
      VALUES 
        ('test_checkout_id', 'test@example.com', 'test', '{}'::jsonb, NOW())
      RETURNING id;
      -- Roll back the transaction
      ROLLBACK;
      RETURN TRUE;
    EXCEPTION WHEN OTHERS THEN
      -- Roll back the transaction
      ROLLBACK;
      RETURN FALSE;
    END;
  END IF;
  
  -- Default case
  RETURN FALSE;
END;
$$;

-- Function to begin a transaction (for testing)
CREATE OR REPLACE FUNCTION begin_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is just a dummy function to test if we can call functions
  RETURN;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION test_insert_permission(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION begin_transaction() TO anon, authenticated;