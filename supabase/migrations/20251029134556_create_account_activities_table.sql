/*
  # Create account_activities table for user activity tracking

  1. New Tables
    - `account_activities`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users
      - `client_id` (text) - Client identifier
      - `activity_type` (text) - Type of activity with extensive options
      - `title` (text) - Activity title
      - `description` (text) - Activity description
      - `currency` (text) - Currency type (usd, euro, cad, gbp, jpy, crypto)
      - `display_amount` (numeric) - Amount to display
      - `status` (text) - Activity status (active, archived, deleted)
      - `priority` (text) - Priority level (low, normal, high, urgent)
      - `is_read` (boolean) - Whether activity has been read
      - `created_by` (uuid) - User who created the activity
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `expires_at` (timestamptz) - Expiration timestamp
      - `metadata` (jsonb) - Additional metadata

  2. Indexes
    - Index on user_id for user-specific queries
    - Index on client_id for client-specific queries
    - Index on activity_type for filtering by type
    - Index on created_at for chronological sorting
    - Index on status for filtering by status
    - Index on is_read for filtering unread items
    - Index on priority for filtering by priority

  3. Security
    - Enable RLS on account_activities table
    - Add policy for authenticated users to read their own activities
    - Add policy for authenticated users to update is_read status
    - Add policy for service role to manage all activities

  4. Constraints
    - Check constraint on currency values
    - Check constraint on activity_type values
    - Check constraint on priority values
    - Check constraint on status values

  5. Triggers
    - Trigger to automatically update updated_at timestamp
*/

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_account_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the table
CREATE TABLE IF NOT EXISTS public.account_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id text NOT NULL,
  activity_type text NOT NULL,
  title text NOT NULL,
  description text,
  currency text DEFAULT 'usd',
  display_amount numeric(15, 2) DEFAULT 0,
  status text DEFAULT 'active',
  priority text DEFAULT 'normal',
  is_read boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT account_activities_pkey PRIMARY KEY (id),
  CONSTRAINT account_activities_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users (id),
  CONSTRAINT account_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT account_activities_currency_check CHECK (
    currency = ANY (ARRAY['usd', 'euro', 'cad', 'gbp', 'jpy', 'crypto'])
  ),
  CONSTRAINT account_activities_activity_type_check CHECK (
    activity_type = ANY (ARRAY[
      'admin_notification', 'system_update', 'security_alert', 'account_notice',
      'service_announcement', 'maintenance_notice', 'policy_update', 'feature_announcement',
      'account_credit', 'account_debit', 'transfer_notification', 'deposit_notification',
      'withdrawal_notification', 'payment_notification', 'balance_inquiry', 'transaction_alert',
      'receipt_notification', 'wire_transfer', 'ach_transfer', 'check_deposit',
      'card_transaction', 'mobile_payment', 'online_banking', 'account_opening',
      'account_closure', 'account_freeze', 'account_unfreeze', 'limit_change',
      'fraud_alert', 'kyc_update', 'compliance_notice', 'statement_ready',
      'promotional_offer', 'service_update', 'support_response', 'appointment_reminder',
      'document_request'
    ])
  ),
  CONSTRAINT account_activities_priority_check CHECK (
    priority = ANY (ARRAY['low', 'normal', 'high', 'urgent'])
  ),
  CONSTRAINT account_activities_status_check CHECK (
    status = ANY (ARRAY['active', 'archived', 'deleted'])
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_account_activities_user_id ON public.account_activities USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_account_activities_client_id ON public.account_activities USING btree (client_id);
CREATE INDEX IF NOT EXISTS idx_account_activities_activity_type ON public.account_activities USING btree (activity_type);
CREATE INDEX IF NOT EXISTS idx_account_activities_created_at ON public.account_activities USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_account_activities_status ON public.account_activities USING btree (status);
CREATE INDEX IF NOT EXISTS idx_account_activities_is_read ON public.account_activities USING btree (is_read);
CREATE INDEX IF NOT EXISTS idx_account_activities_priority ON public.account_activities USING btree (priority);

-- Create trigger
DROP TRIGGER IF EXISTS update_account_activities_updated_at ON public.account_activities;
CREATE TRIGGER update_account_activities_updated_at
  BEFORE UPDATE ON public.account_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_account_activities_updated_at();

-- Enable RLS
ALTER TABLE public.account_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read their own activities
CREATE POLICY "Users can read own activities"
  ON public.account_activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can update is_read status on their own activities
CREATE POLICY "Users can update own activity read status"
  ON public.account_activities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can manage all activities
CREATE POLICY "Service role can manage all activities"
  ON public.account_activities
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);