/*
  # Add trigger for INSERT operations on crypto_transactions

  1. Changes
    - Adds trigger to handle transactions created directly with "Completed" status
    - Modifies the function to work with both INSERT and UPDATE operations
    - Ensures balance deduction happens whether transaction is created as Completed or updated to Completed

  2. Important Notes
    - INSERT trigger: handles transactions created directly with Completed status
    - UPDATE trigger: handles transactions that change from Pending to Completed
*/

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_crypto_transaction_completion ON crypto_transactions;
DROP TRIGGER IF EXISTS trigger_crypto_transaction_insert ON crypto_transactions;

-- Update the function to handle both INSERT and UPDATE
CREATE OR REPLACE FUNCTION process_crypto_transaction_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_balance_column TEXT;
  v_current_balance NUMERIC;
  v_total_amount NUMERIC;
  v_should_process BOOLEAN := FALSE;
BEGIN
  -- Log entry into function
  RAISE NOTICE 'Trigger fired: operation=%, status=%, old_status=%, type=%, user=%', 
    TG_OP, NEW.status, OLD.status, NEW.transaction_type, NEW.user_id;

  -- Determine if we should process this transaction
  IF TG_OP = 'INSERT' THEN
    -- For INSERT: process if status is Completed and type is Transfer
    v_should_process := (NEW.status = 'Completed' AND NEW.transaction_type = 'Transfer');
  ELSIF TG_OP = 'UPDATE' THEN
    -- For UPDATE: process if status changed to Completed (and wasn't already Completed) and type is Transfer
    v_should_process := (
      NEW.status = 'Completed' 
      AND (OLD.status IS NULL OR OLD.status != 'Completed')
      AND NEW.transaction_type = 'Transfer'
    );
  END IF;

  RAISE NOTICE 'Should process: %', v_should_process;

  IF v_should_process THEN
    -- Calculate total amount (amount + gas_fee)
    -- If total_value is NULL or 0, calculate it from amount + gas_fee
    IF NEW.total_value IS NULL OR NEW.total_value = 0 THEN
      v_total_amount := NEW.amount + COALESCE(NEW.gas_fee, 0);
    ELSE
      v_total_amount := NEW.total_value;
    END IF;
    
    RAISE NOTICE 'Calculated total_amount: % (from amount=%, gas_fee=%, total_value=%)', 
      v_total_amount, NEW.amount, NEW.gas_fee, NEW.total_value;
    
    -- Determine which balance column to update based on crypto_type
    v_balance_column := CASE NEW.crypto_type
      WHEN 'BTC' THEN 'btc_balance'
      WHEN 'ETH' THEN 'eth_balance'
      WHEN 'USDT' THEN 'usdt_balance'
      ELSE NULL
    END;
    
    RAISE NOTICE 'Balance column: %, crypto_type: %', v_balance_column, NEW.crypto_type;
    
    -- Only proceed if we have a valid crypto type and amount > 0
    IF v_balance_column IS NOT NULL AND v_total_amount > 0 THEN
      -- Get current balance
      EXECUTE format('SELECT %I FROM newcrypto_balances WHERE user_id = $1', v_balance_column)
      INTO v_current_balance
      USING NEW.user_id;
      
      RAISE NOTICE 'Current balance before deduction: %', v_current_balance;
      
      -- Check if user has a balance record
      IF v_current_balance IS NULL THEN
        -- Create balance record if it doesn't exist
        INSERT INTO newcrypto_balances (user_id, btc_balance, eth_balance, usdt_balance)
        VALUES (NEW.user_id, 0, 0, 0);
        v_current_balance := 0;
        RAISE NOTICE 'Created new balance record for user %', NEW.user_id;
      END IF;
      
      -- Deduct the amount from the balance
      EXECUTE format('
        UPDATE newcrypto_balances 
        SET %I = %I - $1
        WHERE user_id = $2
      ', v_balance_column, v_balance_column)
      USING v_total_amount, NEW.user_id;
      
      RAISE NOTICE 'Successfully deducted % % from user % balance (new balance should be: %)', 
        v_total_amount, NEW.crypto_type, NEW.user_id, v_current_balance - v_total_amount;
    ELSE
      RAISE NOTICE 'Skipped balance deduction: balance_column=%, total_amount=%', 
        v_balance_column, v_total_amount;
    END IF;
  ELSE
    RAISE NOTICE 'Trigger conditions not met';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for INSERT operations (when transaction is created as Completed)
CREATE TRIGGER trigger_crypto_transaction_insert
  AFTER INSERT ON crypto_transactions
  FOR EACH ROW
  EXECUTE FUNCTION process_crypto_transaction_completion();

-- Create trigger for UPDATE operations (when status changes to Completed)
CREATE TRIGGER trigger_crypto_transaction_update
  AFTER UPDATE ON crypto_transactions
  FOR EACH ROW
  EXECUTE FUNCTION process_crypto_transaction_completion();
