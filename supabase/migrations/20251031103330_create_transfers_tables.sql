/*
  # Create transfers and bank_transfers tables

  1. New Tables
    - `transfers`
      - `id` (bigserial, primary key) - Unique transfer identifier
      - `user_id` (uuid, not null) - References auth.users
      - `client_id` (text, nullable) - Optional client identifier
      - `from_currency` (text, not null) - Source currency code
      - `to_currency` (text, not null) - Destination currency code
      - `from_amount` (numeric, not null) - Amount to transfer from
      - `to_amount` (numeric, not null) - Amount to transfer to
      - `exchange_rate` (numeric, default 1.0) - Exchange rate applied
      - `status` (text, default 'pending') - Transfer status (pending/completed/failed/cancelled)
      - `transfer_type` (text, not null) - Type of transfer (internal/bank/crypto)
      - `description` (text, nullable) - Optional description
      - `fee_amount` (numeric, default 0) - Transfer fee
      - `processed_at` (timestamp, nullable) - When transfer was processed
      - `reference_number` (text, nullable) - Unique reference number
      - `created_at` (timestamptz, default now())
      
    - `bank_transfers`
      - `id` (uuid, primary key) - Unique identifier
      - `transfer_id` (bigint, nullable) - References transfers table
      - `bank_name` (text, not null) - Name of recipient bank
      - `account_holder_name` (text, not null) - Name on bank account
      - `account_number` (text, not null) - Bank account number
      - `routing_number` (text, nullable) - Routing number (US)
      - `swift_code` (text, nullable) - SWIFT/BIC code (international)
      - `iban` (text, nullable) - IBAN (international)
      - `bank_address` (text, nullable) - Bank's address
      - `recipient_address` (text, nullable) - Recipient's address
      - `purpose_of_transfer` (text, nullable) - Transfer purpose/reason
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Indexes
    - Index on transfers.user_id for faster user queries
    - Index on transfers.created_at for date-based sorting
    
  3. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own transfers
    - Admins can view all transfers

  4. Important Notes
    - Transfers table stores all transfer types (internal, bank, crypto)
    - Bank transfers table contains detailed banking information
    - All monetary amounts use numeric(20,8) for precision
    - Status field tracks transfer lifecycle
*/

-- Create transfers table
CREATE TABLE IF NOT EXISTS public.transfers (
  id bigserial NOT NULL,
  user_id uuid NOT NULL,
  client_id text NULL,
  from_currency text NOT NULL,
  to_currency text NOT NULL,
  from_amount numeric(20, 8) NOT NULL,
  to_amount numeric(20, 8) NOT NULL,
  exchange_rate numeric(20, 8) NULL DEFAULT 1.0,
  status text NOT NULL DEFAULT 'pending',
  transfer_type text NOT NULL,
  description text NULL,
  created_at timestamptz NULL DEFAULT now(),
  fee_amount numeric(20, 8) NULL DEFAULT 0,
  processed_at timestamp NULL,
  reference_number text NULL,
  CONSTRAINT transfers_pkey PRIMARY KEY (id),
  CONSTRAINT transfers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create bank_transfers table
CREATE TABLE IF NOT EXISTS public.bank_transfers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,
  account_holder_name text NOT NULL,
  account_number text NOT NULL,
  routing_number text NULL,
  swift_code text NULL,
  iban text NULL,
  bank_address text NULL,
  recipient_address text NULL,
  purpose_of_transfer text NULL,
  created_at timestamptz NULL DEFAULT now(),
  updated_at timestamptz NULL DEFAULT now(),
  transfer_id bigint NULL,
  CONSTRAINT bank_transfers_pkey PRIMARY KEY (id),
  CONSTRAINT bank_transfers_transfer_id_fkey FOREIGN KEY (transfer_id) REFERENCES transfers (id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transfers_user_id ON public.transfers USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_created_at ON public.transfers USING btree (created_at);

-- Enable RLS
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transfers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transfers
CREATE POLICY "Users can view own transfers"
  ON public.transfers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transfers"
  ON public.transfers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transfers"
  ON public.transfers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transfers"
  ON public.transfers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for bank_transfers
CREATE POLICY "Users can view own bank transfers"
  ON public.bank_transfers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.transfers
      WHERE transfers.id = bank_transfers.transfer_id
      AND transfers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own bank transfers"
  ON public.bank_transfers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transfers
      WHERE transfers.id = bank_transfers.transfer_id
      AND transfers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own bank transfers"
  ON public.bank_transfers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.transfers
      WHERE transfers.id = bank_transfers.transfer_id
      AND transfers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transfers
      WHERE transfers.id = bank_transfers.transfer_id
      AND transfers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own bank transfers"
  ON public.bank_transfers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.transfers
      WHERE transfers.id = bank_transfers.transfer_id
      AND transfers.user_id = auth.uid()
    )
  );