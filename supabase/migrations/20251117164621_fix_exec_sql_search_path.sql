/*
  # Fix exec_sql function security issue

  1. Changes
    - Add `SET search_path = public` to exec_sql function
    - Prevents search_path vulnerability in SECURITY DEFINER functions

  2. Security
    - Fixed search_path prevents malicious schema injection attacks
    - Function remains SECURITY DEFINER for trigger bypass
*/

CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE query INTO result;
  RETURN result;
END;
$$;