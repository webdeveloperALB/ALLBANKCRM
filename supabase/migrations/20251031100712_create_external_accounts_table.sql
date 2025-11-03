/*
  # Create external_accounts table

  1. New Tables
    - `external_accounts`
      - `id` (uuid, primary key) - Unique identifier for each external account
      - `user_id` (uuid, foreign key) - References auth.users
      - `account_name` (text, required) - Name/label for the external account
      - `bank_name` (text, required) - Name of the external bank
      - `account_number` (text, required) - Account number at external bank
      - `routing_number` (text, optional) - Routing number for transfers
      - `account_type` (text, optional) - Type of account (Checking, Savings, etc.)
      - `currency` (text, optional) - Currency of the account (default USD)
      - `is_verified` (boolean, default false) - Whether the account is verified
      - `created_at` (timestamptz) - When the account was added

  2. Security
    - Enable RLS on `external_accounts` table
    - Add policy for authenticated users to read their own external accounts
    - Add policy for authenticated users to insert their own external accounts
    - Add policy for authenticated users to update their own external accounts
    - Add policy for authenticated users to delete their own external accounts
*/

CREATE TABLE IF NOT EXISTS public.external_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  account_name text NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  routing_number text NULL,
  account_type text NULL DEFAULT 'Checking',
  currency text NULL DEFAULT 'USD',
  is_verified boolean NULL DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT external_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT external_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

ALTER TABLE public.external_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own external accounts"
  ON public.external_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own external accounts"
  ON public.external_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own external accounts"
  ON public.external_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own external accounts"
  ON public.external_accounts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_external_accounts_user_id ON public.external_accounts(user_id);
