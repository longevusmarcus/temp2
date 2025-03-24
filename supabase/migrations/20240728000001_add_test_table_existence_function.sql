CREATE OR REPLACE FUNCTION test_table_existence(tables_to_check text[])
RETURNS TABLE (table_name text, "exists" boolean) AS $$
BEGIN
    FOR i IN 1..array_length(tables_to_check, 1) LOOP
        RETURN QUERY
        SELECT 
            tables_to_check[i] as table_name,
            EXISTS (
                SELECT 1 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = tables_to_check[i]
            ) as "exists";
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Enable the function to be called via RPC
GRANT EXECUTE ON FUNCTION test_table_existence(text[]) TO anon, authenticated, service_role;
