/*
  # Create crypto_transactions table

  1. New Tables
    - `crypto_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `transaction_type` (text) - deposit, withdrawal, trade, transfer
      - `amount` (numeric) - amount of cryptocurrency
      - `currency` (text) - fiat currency (USD, EUR, etc.)
      - `crypto_type` (text) - BTC, ETH, USDT, etc.
      - `description` (text) - transaction description
      - `status` (text) - Pending, Processing, Completed, Rejected
      - `price_per_unit` (numeric, nullable) - price per unit of crypto
      - `total_value` (numeric, nullable) - total value in fiat
      - `wallet_address` (text, nullable) - wallet address
      - `network` (text, nullable) - blockchain network
      - `transaction_hash` (text, nullable) - blockchain transaction hash
      - `gas_fee` (numeric, nullable) - gas/network fee
      - `admin_notes` (text, nullable) - internal admin notes
      - `created_at` (timestamptz) - timestamp
      - `updated_at` (timestamptz) - timestamp

  2. Security
    - Enable RLS on `crypto_transactions` table
    - Add policy for service role full access
    - Add policy for authenticated users to read own transactions
*/

-- Create the crypto_transactions table
CREATE TABLE IF NOT EXISTS public.crypto_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  transaction_type text NOT NULL DEFAULT 'deposit',
  amount numeric(18, 8) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  crypto_type text NOT NULL DEFAULT 'BTC',
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'Pending',
  price_per_unit numeric(18, 8),
  total_value numeric(18, 2),
  wallet_address text,
  network text,
  transaction_hash text,
  gas_fee numeric(18, 8),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT crypto_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT crypto_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_user_id ON public.crypto_transactions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_status ON public.crypto_transactions USING btree (status);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_crypto_type ON public.crypto_transactions USING btree (crypto_type);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_created_at ON public.crypto_transactions USING btree (created_at DESC);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_crypto_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_crypto_transactions_updated_at ON public.crypto_transactions;
CREATE TRIGGER update_crypto_transactions_updated_at
  BEFORE UPDATE ON public.crypto_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_crypto_transactions_updated_at();

-- Enable RLS
ALTER TABLE public.crypto_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access" ON public.crypto_transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.crypto_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.crypto_transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.crypto_transactions;

-- Create policies
CREATE POLICY "Service role full access"
  ON public.crypto_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own transactions"
  ON public.crypto_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.crypto_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.crypto_transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
