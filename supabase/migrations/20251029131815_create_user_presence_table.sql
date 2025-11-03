/*
  # Create user_presence table for online status tracking

  1. New Tables
    - `user_presence`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, unique, foreign key) - References auth.users
      - `is_online` (boolean) - Current online status
      - `last_seen` (timestamptz) - Last activity timestamp
      - `created_at` (timestamptz) - Record creation time
      - `updated_at` (timestamptz) - Record last update time
      - `ip_address` (text) - User's IP address
      - `country` (text) - User's country
      - `country_code` (text) - User's country code
      - `city` (text) - User's city
      - `region` (text) - User's region/state

  2. Indexes
    - Index on user_id for fast lookups
    - Index on is_online for filtering online users
    - Index on last_seen for sorting by activity
    - Index on country for filtering by location
    - Index on ip_address for IP-based queries

  3. Security
    - Enable RLS on user_presence table
    - Add policy for authenticated users to read all presence data
    - Add policy for users to update their own presence
    - Add policy for service role to manage all presence records

  4. Triggers
    - Trigger to automatically update updated_at timestamp
*/

-- Create the table
CREATE TABLE IF NOT EXISTS public.user_presence (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  is_online boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  ip_address text,
  country text,
  country_code text,
  city text,
  region text,
  CONSTRAINT user_presence_pkey PRIMARY KEY (id),
  CONSTRAINT user_presence_user_id_key UNIQUE (user_id),
  CONSTRAINT user_presence_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON public.user_presence USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_is_online ON public.user_presence USING btree (is_online);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON public.user_presence USING btree (last_seen);
CREATE INDEX IF NOT EXISTS idx_user_presence_country ON public.user_presence USING btree (country);
CREATE INDEX IF NOT EXISTS idx_user_presence_ip ON public.user_presence USING btree (ip_address);

-- Create trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_user_presence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_user_presence_updated_at ON public.user_presence;
CREATE TRIGGER trigger_update_user_presence_updated_at
  BEFORE UPDATE ON public.user_presence
  FOR EACH ROW
  EXECUTE FUNCTION update_user_presence_updated_at();

-- Enable RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all presence data
CREATE POLICY "Authenticated users can read all presence"
  ON public.user_presence
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can insert their own presence
CREATE POLICY "Users can insert own presence"
  ON public.user_presence
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own presence
CREATE POLICY "Users can update own presence"
  ON public.user_presence
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can manage all presence records
CREATE POLICY "Service role can manage all presence"
  ON public.user_presence
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);