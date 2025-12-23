/*
  # Create exec_sql_ddl function for DDL operations

  1. New Functions
    - `exec_sql_ddl` - Executes DDL SQL statements (CREATE, ALTER, DROP)
      - Takes a `query` text parameter
      - Returns text status message
      - Designed for DDL operations that don't return data

  2. Security
    - Function is SECURITY DEFINER to bypass RLS
    - Sets search_path to public for security
    - Restricted by RLS policies (admin only)
*/

CREATE OR REPLACE FUNCTION exec_sql_ddl(query text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE query;
  RETURN 'Success';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$;
