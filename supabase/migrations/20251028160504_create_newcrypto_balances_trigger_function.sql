/*
  # Create trigger function for newcrypto_balances updated_at

  1. New Functions
    - `update_newcrypto_balances_updated_at()` - Automatically updates the updated_at timestamp

  2. Changes
    - Creates a reusable trigger function that sets updated_at to NOW() on row updates
*/

-- Create the trigger function for updating the updated_at timestamp
CREATE OR REPLACE FUNCTION update_newcrypto_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
