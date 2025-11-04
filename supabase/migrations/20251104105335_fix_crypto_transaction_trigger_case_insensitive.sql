/*
  # Fix crypto transaction trigger to be case-insensitive

  1. Changes
    - Makes transaction_type comparison case-insensitive (UPPER comparison)
    - Handles both 'Transfer' and 'transfer' values
    - Adds more detailed logging for debugging
*/

CREATE OR REPLACE FUNCTION process_crypto_transaction_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_balance_column TEXT;
  v_current_balance NUMERIC;
  v_total_amount NUMERIC;
  v_should_process BOOLEAN := FALSE;
BEGIN
  -- Log entry into function with all important values
  RAISE NOTICE '=== TRIGGER START ===';
  RAISE NOTICE 'Operation: %, Status: %, Transaction Type: %, User ID: %', 
    TG_OP, NEW.status, NEW.transaction_type, NEW.user_id;
  RAISE NOTICE 'Amount: %, Gas Fee: %, Total Value: %', 
    NEW.amount, NEW.gas_fee, NEW.total_value;
  
  IF TG_OP = 'UPDATE' THEN
    RAISE NOTICE 'Old Status: %', OLD.status;
  END IF;

  -- Determine if we should process this transaction (case-insensitive)
  IF TG_OP = 'INSERT' THEN
    -- For INSERT: process if status is Completed and type is Transfer (case-insensitive)
    v_should_process := (
      NEW.status = 'Completed' 
      AND UPPER(NEW.transaction_type) = 'TRANSFER'
    );
    RAISE NOTICE 'INSERT check: status=%s, type=%s, should_process=%s', 
      NEW.status, NEW.transaction_type, v_should_process;
  ELSIF TG_OP = 'UPDATE' THEN
    -- For UPDATE: process if status changed to Completed and type is Transfer (case-insensitive)
    v_should_process := (
      NEW.status = 'Completed' 
      AND (OLD.status IS NULL OR OLD.status != 'Completed')
      AND UPPER(NEW.transaction_type) = 'TRANSFER'
    );
    RAISE NOTICE 'UPDATE check: new_status=%s, old_status=%s, type=%s, should_process=%s', 
      NEW.status, OLD.status, NEW.transaction_type, v_should_process;
  END IF;

  IF v_should_process THEN
    RAISE NOTICE 'Processing balance deduction...';
    
    -- Calculate total amount (amount + gas_fee)
    IF NEW.total_value IS NULL OR NEW.total_value = 0 THEN
      v_total_amount := NEW.amount + COALESCE(NEW.gas_fee, 0);
      RAISE NOTICE 'Calculated total_amount from amount + gas_fee: %', v_total_amount;
    ELSE
      v_total_amount := NEW.total_value;
      RAISE NOTICE 'Using provided total_value: %', v_total_amount;
    END IF;
    
    -- Determine which balance column to update based on crypto_type
    v_balance_column := CASE UPPER(NEW.crypto_type)
      WHEN 'BTC' THEN 'btc_balance'
      WHEN 'ETH' THEN 'eth_balance'
      WHEN 'USDT' THEN 'usdt_balance'
      ELSE NULL
    END;
    
    RAISE NOTICE 'Balance column: % (crypto_type: %)', v_balance_column, NEW.crypto_type;
    
    -- Only proceed if we have a valid crypto type and amount > 0
    IF v_balance_column IS NOT NULL AND v_total_amount > 0 THEN
      -- Get current balance
      EXECUTE format('SELECT %I FROM newcrypto_balances WHERE user_id = $1', v_balance_column)
      INTO v_current_balance
      USING NEW.user_id;
      
      RAISE NOTICE 'Current balance: %', COALESCE(v_current_balance, 0);
      
      -- Check if user has a balance record
      IF v_current_balance IS NULL THEN
        RAISE NOTICE 'No balance record found, creating one...';
        INSERT INTO newcrypto_balances (user_id, btc_balance, eth_balance, usdt_balance)
        VALUES (NEW.user_id, 0, 0, 0);
        v_current_balance := 0;
      END IF;
      
      -- Deduct the amount from the balance
      RAISE NOTICE 'Deducting % from % balance', v_total_amount, v_balance_column;
      
      EXECUTE format('
        UPDATE newcrypto_balances 
        SET %I = %I - $1
        WHERE user_id = $2
      ', v_balance_column, v_balance_column)
      USING v_total_amount, NEW.user_id;
      
      -- Get new balance to confirm
      EXECUTE format('SELECT %I FROM newcrypto_balances WHERE user_id = $1', v_balance_column)
      INTO v_current_balance
      USING NEW.user_id;
      
      RAISE NOTICE 'New balance after deduction: %', v_current_balance;
      RAISE NOTICE '=== DEDUCTION SUCCESSFUL ===';
    ELSE
      RAISE WARNING 'Skipped balance deduction: balance_column=%, total_amount=%', 
        v_balance_column, v_total_amount;
    END IF;
  ELSE
    RAISE NOTICE 'Trigger conditions not met, skipping processing';
  END IF;
  
  RAISE NOTICE '=== TRIGGER END ===';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers to ensure they use the updated function
DROP TRIGGER IF EXISTS trigger_crypto_transaction_insert ON crypto_transactions;
DROP TRIGGER IF EXISTS trigger_crypto_transaction_update ON crypto_transactions;

CREATE TRIGGER trigger_crypto_transaction_insert
  AFTER INSERT ON crypto_transactions
  FOR EACH ROW
  EXECUTE FUNCTION process_crypto_transaction_completion();

CREATE TRIGGER trigger_crypto_transaction_update
  AFTER UPDATE ON crypto_transactions
  FOR EACH ROW
  EXECUTE FUNCTION process_crypto_transaction_completion();
