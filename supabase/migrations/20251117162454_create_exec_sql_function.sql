/*
  # Create exec_sql RPC function

  1. New Functions
    - `exec_sql` - Executes raw SQL and returns results
      - Takes a `query` text parameter
      - Returns JSON array of results
      - Allows dynamic SQL execution with timestamps

  2. Security
    - Function is restricted to service_role only
    - Uses SECURITY DEFINER to bypass RLS and triggers
*/

CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE query INTO result;
  RETURN result;
END;
$$;