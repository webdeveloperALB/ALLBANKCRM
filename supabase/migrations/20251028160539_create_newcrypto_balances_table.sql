/*
  # Create newcrypto_balances table

  1. New Tables
    - `newcrypto_balances`
      - `id` (uuid, primary key) - Unique identifier for each balance record
      - `user_id` (uuid, unique, not null) - References auth.users, one balance record per user
      - `btc_balance` (numeric(18, 8), default 0.00000000) - Bitcoin balance with 8 decimal precision
      - `eth_balance` (numeric(18, 8), default 0.00000000) - Ethereum balance with 8 decimal precision
      - `usdt_balance` (numeric(12, 6), default 0.000000) - USDT balance with 6 decimal precision
      - `created_at` (timestamptz, default now()) - Record creation timestamp
      - `updated_at` (timestamptz, default now()) - Last update timestamp

  2. Indexes
    - Primary key on `id`
    - Unique index on `user_id` for fast lookups and enforcing one record per user
    - Indexes on balance columns for efficient filtering and sorting

  3. Security
    - Enable RLS on `newcrypto_balances` table
    - Add policy for authenticated users to read their own crypto balances
    - Add policy for service role to manage all crypto balances (for admin operations)

  4. Triggers
    - Automatic `updated_at` timestamp update on row modification
*/

-- Create the newcrypto_balances table
CREATE TABLE IF NOT EXISTS public.newcrypto_balances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  btc_balance numeric(18, 8) NOT NULL DEFAULT 0.00000000,
  eth_balance numeric(18, 8) NOT NULL DEFAULT 0.00000000,
  usdt_balance numeric(12, 6) NOT NULL DEFAULT 0.000000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT newcrypto_balances_pkey PRIMARY KEY (id),
  CONSTRAINT newcrypto_balances_user_id_key UNIQUE (user_id),
  CONSTRAINT newcrypto_balances_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_newcrypto_balances_user_id ON public.newcrypto_balances USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_newcrypto_balances_btc ON public.newcrypto_balances USING btree (btc_balance);
CREATE INDEX IF NOT EXISTS idx_newcrypto_balances_eth ON public.newcrypto_balances USING btree (eth_balance);
CREATE INDEX IF NOT EXISTS idx_newcrypto_balances_usdt ON public.newcrypto_balances USING btree (usdt_balance);

-- Create the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_newcrypto_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_newcrypto_balances_updated_at ON public.newcrypto_balances;
CREATE TRIGGER update_newcrypto_balances_updated_at
  BEFORE UPDATE ON public.newcrypto_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_newcrypto_balances_updated_at();

-- Enable Row Level Security
ALTER TABLE public.newcrypto_balances ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own crypto balances
CREATE POLICY "Users can view own crypto balances"
  ON public.newcrypto_balances
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own crypto balances
CREATE POLICY "Users can insert own crypto balances"
  ON public.newcrypto_balances
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own crypto balances
CREATE POLICY "Users can update own crypto balances"
  ON public.newcrypto_balances
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can manage all crypto balances (for admin operations)
CREATE POLICY "Service role can manage all crypto balances"
  ON public.newcrypto_balances
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
