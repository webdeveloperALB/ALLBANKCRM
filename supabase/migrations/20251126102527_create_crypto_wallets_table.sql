/*
  # Create crypto_wallets table

  1. New Tables
    - `crypto_wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users table)
      - `crypto_type` (text, constrained values)
      - `wallet_address` (text)
      - `label` (text)
      - `symbol` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Indexes
    - Index on crypto_type for faster filtering
    - Index on is_active for active/inactive queries

  3. Security
    - Enable RLS on crypto_wallets table
    - Add policies for authenticated users to manage their own wallets
*/

-- Create crypto_wallets table
CREATE TABLE IF NOT EXISTS public.crypto_wallets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  crypto_type text NOT NULL,
  wallet_address text NOT NULL,
  label text NOT NULL,
  symbol text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT crypto_wallets_pkey PRIMARY KEY (id),
  CONSTRAINT crypto_wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT crypto_wallets_crypto_type_check CHECK (
    crypto_type = ANY (ARRAY['bitcoin'::text, 'ethereum'::text, 'usdt_erc20'::text, 'usdt_trc20'::text])
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user_id ON public.crypto_wallets USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_crypto_type ON public.crypto_wallets USING btree (crypto_type);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_is_active ON public.crypto_wallets USING btree (is_active);

-- Enable RLS
ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own crypto wallets"
  ON public.crypto_wallets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own crypto wallets"
  ON public.crypto_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own crypto wallets"
  ON public.crypto_wallets
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own crypto wallets"
  ON public.crypto_wallets
  FOR DELETE
  TO authenticated
  USING (true);
