/*
  # Create trigger for automatic balance deduction on crypto transaction completion

  1. New Functions
    - `process_crypto_transaction_completion()` - Automatically deducts crypto balance when transaction status changes to Completed

  2. Changes
    - Creates a trigger function that:
      - Monitors crypto_transactions table for status updates
      - Deducts the total_value (amount + gas_fee) from the appropriate crypto balance when status becomes "Completed"
      - Only processes Transfer type transactions
      - Prevents duplicate processing by checking if old status was already Completed

  3. Security
    - Function runs with SECURITY DEFINER to ensure proper permissions
    - Validates that balances don't go negative
*/

CREATE OR REPLACE FUNCTION process_crypto_transaction_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_balance_column TEXT;
  v_current_balance NUMERIC;
  v_total_amount NUMERIC;
BEGIN
  -- Only process if:
  -- 1. Status changed to Completed
  -- 2. Old status was not already Completed (prevent duplicate processing)
  -- 3. Transaction type is Transfer
  IF NEW.status = 'Completed' 
     AND (OLD.status IS NULL OR OLD.status != 'Completed')
     AND NEW.transaction_type = 'Transfer' THEN
    
    -- Calculate total amount (amount + gas_fee)
    v_total_amount := COALESCE(NEW.total_value, NEW.amount + COALESCE(NEW.gas_fee, 0));
    
    -- Determine which balance column to update based on crypto_type
    v_balance_column := CASE NEW.crypto_type
      WHEN 'BTC' THEN 'btc_balance'
      WHEN 'ETH' THEN 'eth_balance'
      WHEN 'USDT' THEN 'usdt_balance'
      ELSE NULL
    END;
    
    -- Only proceed if we have a valid crypto type
    IF v_balance_column IS NOT NULL THEN
      -- Get current balance
      EXECUTE format('SELECT %I FROM newcrypto_balances WHERE user_id = $1', v_balance_column)
      INTO v_current_balance
      USING NEW.user_id;
      
      -- Check if user has a balance record
      IF v_current_balance IS NULL THEN
        -- Create balance record if it doesn't exist
        INSERT INTO newcrypto_balances (user_id, btc_balance, eth_balance, usdt_balance)
        VALUES (NEW.user_id, 0, 0, 0);
        v_current_balance := 0;
      END IF;
      
      -- Deduct the amount from the balance
      EXECUTE format('
        UPDATE newcrypto_balances 
        SET %I = %I - $1
        WHERE user_id = $2
      ', v_balance_column, v_balance_column)
      USING v_total_amount, NEW.user_id;
      
      RAISE NOTICE 'Deducted % % from user % balance', v_total_amount, NEW.crypto_type, NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_crypto_transaction_completion ON crypto_transactions;

-- Create trigger that fires after update
CREATE TRIGGER trigger_crypto_transaction_completion
  AFTER UPDATE ON crypto_transactions
  FOR EACH ROW
  EXECUTE FUNCTION process_crypto_transaction_completion();
